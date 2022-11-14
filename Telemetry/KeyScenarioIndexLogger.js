"use strict";
exports.__esModule = true;
exports.KeyScenarioIndexLogger = void 0;
var guid_typescript_1 = require("guid-typescript");
var EventLogger_1 = require("./EventLogger");
/**
 * Utility Class for implementing Performance Telemetry
 *
 */
var KeyScenarioIndexLogger = /** @class */ (function () {
    function KeyScenarioIndexLogger() {
        this.scenarioCache = new Map();
        this.timerId = setInterval(this.checkForTimeout.bind(this), 1000);
    }
    /**
     * Initiate the event and properties to be logged
     * @param {string}scenarioName
     * @param {number}timeout In Milliseconds. Determines when to log a failure if scenario has expired
     * @returns {string} correlationId used to link (success and failure) messages to the scenario telemetry
     */
    KeyScenarioIndexLogger.prototype.startScenario = function (scenarioName, timeout) {
        //generate a new scenario id
        var correlationId = guid_typescript_1.Guid.create().toString(); //In prod will use crypto.randomUUID()
        var startTime = new Date(Date.now());
        var timeoutTime = this.CalculateTimeout(startTime, timeout);
        //Create a new IScenario
        var scenario = {
            correlationId: correlationId,
            fileName: "KeyScenarioIndexLogger.ts",
            scenarioName: scenarioName,
            startTime: startTime,
            lastReportedEventTime: startTime,
            timeoutTime: timeoutTime
        };
        //add to associated cache
        this.scenarioCache.set(correlationId, scenario);
        //Log initial state to Telemetry
        EventLogger_1.LogTelemetryMock(scenario, "Executing Scenario", 0, //Event Duration
        0, //Total Duration
        null //Scenario status is null since hasn't been completed
        );
        return correlationId;
    };
    /**
     * Query the current Scenario Cache for the target scenario
     * @param scenarioName to look for
     * @returns true if correlationId maps to a scenario
     */
    KeyScenarioIndexLogger.prototype.scenarioExists = function (correlationId) {
        return this.scenarioCache.has(correlationId);
    };
    /**
     * Scenario has successfully completed
     * @param correlationId
     */
    KeyScenarioIndexLogger.prototype.logSuccess = function (correlationId) {
        this.logProperties(correlationId, "Scenario Completed Successfully", true, true);
    };
    /**
     * Scenario has terminated unsuccessfully
     * @param correlationId
     */
    KeyScenarioIndexLogger.prototype.logFailure = function (correlationId) {
        this.logProperties(correlationId, "Scenario Failed", true, false);
    };
    /**
     * Scenario is still active. Logging custom message and leave scenario running
     * @param correlationId
     * @param message
     */
    KeyScenarioIndexLogger.prototype.logEvent = function (correlationId, message) {
        this.logProperties(correlationId, message, false);
    };
    /**
     * Setup properties for logging to telemetry
     * @param {string} correlationId - correlationId of the event
     * @param {string} message - Event text to log
     * @param {boolean} closeScenario - Is the scenario still active
     * @param {boolean} scenarioStatus - True if scenario was a success, false otherwise
     * @returns void
     */
    KeyScenarioIndexLogger.prototype.logProperties = function (correlationId, message, closeScenario, scenarioStatus) {
        //Check if scenario exists
        var scenarioExists = this.scenarioExists(correlationId);
        if (!scenarioExists) {
            //TODO: Implement this
            EventLogger_1.LogErrorMock(correlationId, "No existing scenario found matching correlationID", 0, 0, false);
            return;
        }
        var scenario = this.scenarioCache.get(correlationId);
        var duration = this.getDurationFromLastReportedEvent(scenario);
        scenario.lastReportedEventTime = new Date(Date.now()); //update lastReportedEventTime
        var totalDuration = this.calculateDuration(scenario.startTime, scenario.lastReportedEventTime);
        //Is scenario done executing
        if (closeScenario) {
            //TODO: Log into telemetry success/failure event [scenarioStatus]
            if (scenarioStatus) {
                //this.logSuccess(correlationId);
                EventLogger_1.LogTelemetryMock(scenario, "Scenario Success", duration, //Event Duration
                totalDuration, //Total Duration
                false);
            }
            else {
                EventLogger_1.LogTelemetryMock(scenario, "Scenario Failed", duration, //Event Duration
                totalDuration, //Total Duration
                false);
            }
            //remove from cache
            this.scenarioCache["delete"](correlationId);
        }
        else {
            EventLogger_1.LogTelemetryMock(scenario, message, duration, totalDuration, null);
        }
    };
    /**
     * Determines the duration from previous scenario to current time.
     * @param scenario
     * @returns
     */
    KeyScenarioIndexLogger.prototype.getDurationFromLastReportedEvent = function (scenario) {
        return this.calculateDuration(scenario.lastReportedEventTime, new Date(Date.now()));
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
    /**
     * Iterate through the associated cache to determine if any scenarios have expired
     * @returns
     */
    KeyScenarioIndexLogger.prototype.checkForTimeout = function () {
        var _this = this;
        //This method is hitting an infinite loop. Investigate
        //Go through all of the current scenarios
        if (!this.scenarioCache.size)
            return;
        this.scenarioCache.forEach(function (value, key) {
            if (value.timeoutTime <= new Date(Date.now())) {
                //Date is expired
                //TODO: Log scenario expiration [this.logFailure]
                _this.logEvent(value.correlationId, "Scenario has reached timeout limit");
                _this.logFailure(value.correlationId);
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
    return KeyScenarioIndexLogger;
}());
exports.KeyScenarioIndexLogger = KeyScenarioIndexLogger;
/** TODO: Subscenario
 * Start a new scenario
 * Set timeout specific
 * Create async function (setTimeout,)
 * have function call success function on callback after timeout elapsed
 * assert scenario was removed from cache before success was logged
 * Main thread needs to be blocked before async function is handled
 **/
/**
 * StartSubScenario
 * params: parent corelation
 *
 * parent - corrId
 * ---child -- childCorrId
 * -----nestedChild -- nCorrId
 */
