"use strict";
exports.__esModule = true;
exports.KeyScenarioIndexLogger = void 0;
var guid_typescript_1 = require("guid-typescript");
var helpers_1 = require("./helpers");
var EventLogger_1 = require("./EventLogger");
/**
 * Utility Class for implementing Performance Telemetry
 *
 */
var KeyScenarioIndexLogger = /** @class */ (function () {
    function KeyScenarioIndexLogger() {
        this.scenarioCache = new Map();
        this._traceID = guid_typescript_1.Guid.create().toString();
        this.timerId = setInterval(this.checkForTimeout.bind(this), 1000);
    }
    KeyScenarioIndexLogger.Instance = function () {
        return this._Instance || (this._Instance = new this());
    };
    /**
     * Initiate the event and properties to be logged
     * @param {string}scenarioName - Name of the operation to be conducted
     * @param {number}timeout In Milliseconds. Determines when to log a failure if scenario has expired
     * @param {string} File name where scenario is located
     * @returns {string} scenarioContextID used to link (success and failure) messages to the scenario telemetry
     */
    KeyScenarioIndexLogger.prototype.startMainScenario = function (scenarioName, timeout, fileName) {
        //generate a new scenario id
        var scenarioContextID = guid_typescript_1.Guid.create().toString();
        var startTime = new Date(Date.now());
        var timeoutTime = this.CalculateTimeout(startTime, timeout);
        //Create a new IScenarioContext
        var scenario = {
            scenarioContextID: scenarioContextID,
            scenarioName: scenarioName,
            startTime: startTime,
            lastReportedEventTime: startTime,
            timoutThresholdTime: timeoutTime,
            fileName: fileName
        };
        //add to associated cache
        this.scenarioCache.set(scenarioContextID, scenario);
        //Log initial state to Telemetry
        EventLogger_1.logPerfEvent(scenario, "Executing Scenario: " + scenarioName, null, //Scenario status is null since hasn't been completed
        this._traceID, 0, helpers_1.KSIOpCodes.SCENARIO_START);
        return scenarioContextID;
    };
    /**
     * Initiate a nested event and properties to be logged
     * @param {string}scenarioName - Name of the operation to be conducted
     * @param {number} timeout In Milliseconds. Determines when to log a failure if scenario has expired
     * @param {string} File name where sub event was executed
     * @param {string} parentCorrelation correlationId.
     * @returns
     */
    KeyScenarioIndexLogger.prototype.startSubScenario = function (scenarioName, timeout, fileName, parentScenarioContextID) {
        var scenarioContextID = guid_typescript_1.Guid.create().toString();
        var startTime = new Date(Date.now());
        var timeoutTime = this.CalculateTimeout(startTime, timeout);
        var scenario = {
            scenarioContextID: scenarioContextID,
            parentScenarioContextID: parentScenarioContextID,
            scenarioName: scenarioName,
            startTime: startTime,
            lastReportedEventTime: startTime,
            timoutThresholdTime: timeoutTime,
            fileName: fileName
        };
        this.scenarioCache.set(scenarioContextID, scenario);
        //Log initial state to Telemetry
        EventLogger_1.logPerfEvent(scenario, "Executing Sub Scenario: " + scenarioName, null, //Scenario status is null since hasn't been completed
        this._traceID, 0, helpers_1.KSIOpCodes.SCENARIO_START);
        return scenarioContextID;
    };
    /**
     * Query the current Scenario Cache for the target scenario
     * @param scenarioContextID
     * @returns true if scenarioContextID maps to a scenario
     */
    KeyScenarioIndexLogger.prototype.scenarioExists = function (scenarioContextID) {
        return this.scenarioCache.has(scenarioContextID);
    };
    /**
     * Scenario has successfully completed
     * @param {string} scenarioContextID
     */
    KeyScenarioIndexLogger.prototype.logSuccess = function (scenarioContextID) {
        this.logProperties(scenarioContextID, "Completed Successfully", true, true);
    };
    /**
     * Scenario has terminated unsuccessfully
     * @param {string} scenarioContextID
     */
    KeyScenarioIndexLogger.prototype.logFailure = function (scenarioContextID) {
        this.logProperties(scenarioContextID, "Failed", true, false);
    };
    /**
     * Scenario is still active. Logging custom message and leave scenario running
     * @param {string} scenarioContextID
     * @param {string} message
     */
    KeyScenarioIndexLogger.prototype.logEvent = function (scenarioContextID, message) {
        this.logProperties(scenarioContextID, message, false);
    };
    /**
     * Setup properties for logging to telemetry
     * @param {string}  scenarioContextID - scenarioContextID of the event
     * @param {string}  message - Event text to log
     * @param {boolean} closeScenario - Is the scenario still active
     * @param {boolean} scenarioSuccessful - True if scenario was a success, false otherwise
     */
    KeyScenarioIndexLogger.prototype.logProperties = function (scenarioContextID, message, closeScenario, scenarioSuccessful) {
        //Check if scenario exists
        var scenarioExists = this.scenarioExists(scenarioContextID);
        if (!scenarioExists) {
            EventLogger_1.logPerfError(scenarioContextID, "No existing scenario found matching scenarioContextID", false, this._traceID);
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        var scenario = this.scenarioCache.get(scenarioContextID);
        scenario.lastReportedEventTime = new Date(Date.now());
        var totalScenarioDuration = this.calculateDuration(scenario.startTime, scenario.lastReportedEventTime);
        //Is scenario done executing
        if (closeScenario) {
            if (scenarioSuccessful) {
                EventLogger_1.logPerfEvent(scenario, message, true, this._traceID, totalScenarioDuration, helpers_1.KSIOpCodes.SCENARIO_END);
            }
            else {
                EventLogger_1.logPerfEvent(scenario, message, false, this._traceID, totalScenarioDuration, helpers_1.KSIOpCodes.SCENARIO_END);
            }
            //remove from cache
            this.scenarioCache["delete"](scenarioContextID);
        }
        else {
            EventLogger_1.logPerfEvent(scenario, message, null, this._traceID, totalScenarioDuration, helpers_1.KSIOpCodes.SCENARIO_INTERVAL);
        }
    };
    /**
     * Iterate through the associated cache to determine if any scenarios have expired
     */
    KeyScenarioIndexLogger.prototype.checkForTimeout = function () {
        var _this = this;
        //This method is hitting an infinite loop. Investigate
        //Go through all of the current scenarios
        if (!this.scenarioCache.size)
            return;
        this.scenarioCache.forEach(function (value) {
            if (value.timoutThresholdTime <= new Date(Date.now())) {
                //Date is expired
                _this.logEvent(value.scenarioContextID, "Scenario has reached timeout limit");
                _this.logFailure(value.scenarioContextID);
            }
        });
    };
    /**
     * Accepts a Date object incrememented by a provided timeout in milliseconds
     * @param {Date} time
     * @param {Date} timoutInMs
     * @returns {Date}
     */
    KeyScenarioIndexLogger.prototype.CalculateTimeout = function (time, timoutInMs) {
        var newDate = new Date();
        newDate.setTime(time.getTime() + timoutInMs);
        return newDate;
    };
    /**
     * Helper function to calculate lapsed time between to Datetime Objects
     * @param {Date} begin - Last Reported Event time
     * @param {Date} end - Current Timestamp
     * @returns
     */
    KeyScenarioIndexLogger.prototype.calculateDuration = function (begin, end) {
        var min = begin < end ? begin : end;
        var max = begin > end ? begin : end;
        return Math.round(((max.getTime() - min.getTime()) / 1000) * 1000) / 1000;
    };
    return KeyScenarioIndexLogger;
}());
exports.KeyScenarioIndexLogger = KeyScenarioIndexLogger;
