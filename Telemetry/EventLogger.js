"use strict";
exports.__esModule = true;
exports.LogErrorMock = exports.LogTelemetryMock = void 0;
var LogTelemetryMock = function (scenario, message, fileName, eventDuration, totalDuration, scenarioSuccessful, activityId) {
    var _a;
    console.table([{
            "TimeStamp": new Date(Date.now()),
            "FileName": fileName,
            "ScenarioName": scenario.scenarioName,
            "scenarioContextID": scenario.scenarioContextID,
            "ParentScenarioContextID": (_a = scenario.parentScenarioContextID) !== null && _a !== void 0 ? _a : null,
            "ScenarioStartTime ": scenario.startTime,
            "Message": message,
            "DurationFromStart": totalDuration,
            "IsScenarioSuccessful": scenarioSuccessful,
            "DurationFromLastEvent": eventDuration,
            "ActivityId": activityId
        }]);
};
exports.LogTelemetryMock = LogTelemetryMock;
var LogErrorMock = function (scenarioContextID, fileName, message, eventDuration, totalDuration, scenarioSuccessful, parentScenarioContextID, activityId) {
    console.table([{
            "TimeStamp": new Date(Date.now()),
            "FileName": fileName,
            "scenarioContextID": scenarioContextID,
            "ParentScenarioContextID": parentScenarioContextID !== null && parentScenarioContextID !== void 0 ? parentScenarioContextID : null,
            "Message": message,
            "DurationFromStart": totalDuration,
            "IsScenarioSuccessful": scenarioSuccessful,
            "DurationFromLastEvent": eventDuration,
            "ActivityId": activityId
        }]);
};
exports.LogErrorMock = LogErrorMock;
