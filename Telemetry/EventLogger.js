"use strict";
exports.__esModule = true;
exports.LogErrorMock = exports.LogTelemetryMock = void 0;
var LogTelemetryMock = function (scenario, message, eventDuration, totalDuration, scenarioStatus) {
    console.table([{
            "ScenarioName": scenario.scenarioName,
            "CorrelationId": scenario.correlationId,
            "FileName": scenario.fileName,
            "StartTime": scenario.startTime,
            "TimeStamp": new Date(Date.now()),
            "Message": message,
            "TotalDuration": totalDuration,
            "ScenarioStatus": scenarioStatus,
            "EventDuration": eventDuration
        }]);
};
exports.LogTelemetryMock = LogTelemetryMock;
var LogErrorMock = function (correlationId, message, eventDuration, totalDuration, scenarioStatus) {
    console.table([{
            "CorrelationId": correlationId,
            "Message": message,
            "TimeStamp": new Date(Date.now()),
            "TotalDuration": totalDuration,
            "ScenarioStatus": scenarioStatus,
            "EventDuration": eventDuration
        }]);
};
exports.LogErrorMock = LogErrorMock;
