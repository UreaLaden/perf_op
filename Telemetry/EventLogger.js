"use strict";
exports.__esModule = true;
exports.LogErrorMock = exports.LogTelemetryMock = void 0;
var LogTelemetryMock = function (scenario, message, scenarioSuccessful, traceID) {
    var _a;
    console.table([{
            "TimeStamp": new Date(Date.now()),
            "FileName": scenario.fileName,
            "ScenarioName": scenario.scenarioName,
            "scenarioContextID": scenario.scenarioContextID,
            "ParentScenarioContextID": (_a = scenario.parentScenarioContextID) !== null && _a !== void 0 ? _a : null,
            "Message": message,
            "IsScenarioSuccessful": scenarioSuccessful,
            "TraceID": traceID
        }]);
};
exports.LogTelemetryMock = LogTelemetryMock;
var LogErrorMock = function (scenarioContextID, message, scenarioSuccessful, traceID, parentScenarioContextID) {
    console.table([{
            "TimeStamp": new Date(Date.now()),
            "FileName": null,
            "ScenarioName": null,
            "scenarioContextID": scenarioContextID,
            "ParentScenarioContextID": parentScenarioContextID !== null && parentScenarioContextID !== void 0 ? parentScenarioContextID : null,
            "Message": message,
            "IsScenarioSuccessful": scenarioSuccessful,
            "TraceID": traceID
        }]);
};
exports.LogErrorMock = LogErrorMock;
