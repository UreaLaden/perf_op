"use strict";
exports.__esModule = true;
exports.logPerfError = exports.logPerfEvent = void 0;
var helpers_1 = require("./helpers");
/**
 * Log a Performance event of any priority.
 * @param {IScenario} scenario: The scenario object to be logged
 * @param {string} message  -  A string that contains detail of the perf event.
 * @param {boolean} scenarioSuccessful - True if the scenario executed successfully or false it scenario failed
 * @param {string} traceId - Engineers may provide a value here to correlate their scenario with external tables
 * @param {number} duration  - Time Difference from ScenarioStartTime to current Timestamp.
 * @param {boolean} isScenarioStart - Is this event the first log in the scenario. Defaults to false
 * @param priority (optional) specify the priority for sending the event. If not provided, a default priority will be used.
 */
var logPerfEvent = function (scenario, message, scenarioSuccessful, traceID, duration, opCode, priority) {
    var _a;
    console.table([{
            time_stamp: new Date(Date.now()).toISOString(),
            fileName: scenario.fileName,
            scenarioName: scenario.scenarioName,
            scenarioContextID: scenario.scenarioContextID,
            parentScenarioContextID: (_a = scenario.parentScenarioContextID) !== null && _a !== void 0 ? _a : undefined,
            message: message,
            isScenarioSuccessful: scenarioSuccessful,
            traceId: traceID,
            scenarioStartTime: scenario.startTime.toISOString(),
            lastEventStartTime: scenario.lastReportedEventTime.toISOString(),
            opCode: opCode,
            totalScenarioDuration: duration
        }]);
};
exports.logPerfEvent = logPerfEvent;
/**
 * Log a Performance event of any priority.
 * @param {string} scenarioContextID: The Scenario Context ID that trigger the error
 * @param {string} message  -  A string that contains detail of the perf event.
 * @param {boolean} scenarioSuccessful - True if the scenario executed successfully or false it scenario failed
 * @param {string} traceId - Engineers may provide a value here to correlate their scenario with external tables
 * @param {string} parentScenarioContextID [Optional]: The parent scenario Context ID that should be reference. Defaults to null
 * @param priority (optional) specify the priority for sending the event. If not provided, a default priority will be used.
 */
var logPerfError = function (scenarioContextID, message, scenarioSuccessful, traceID, parentScenarioContextID, priority) {
    console.table([{
            time_stamp: new Date(Date.now()).toISOString(),
            fileName: null,
            scenarioName: null,
            scenarioContextID: scenarioContextID,
            parentScenarioContextID: parentScenarioContextID !== null && parentScenarioContextID !== void 0 ? parentScenarioContextID : null,
            message: message,
            isScenarioSuccessful: scenarioSuccessful,
            traceId: traceID,
            scenarioStartTime: null,
            lastEventStartTime: null,
            opCode: helpers_1.KSIOpCodes.SCENARIO_ERROR,
            totalScenarioDuration: -1
        }]);
};
exports.logPerfError = logPerfError;
