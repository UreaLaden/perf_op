import { IScenario } from "./IScenario";

export const LogTelemetryMock = (
  scenario: IScenario,
  message: string,
  eventDuration: number,
  totalDuration: number,
  scenarioStatus: boolean
) => {
  console.table([{
    "ScenarioName":scenario.scenarioName,
    "CorrelationId":scenario.correlationId,
    "FileName":scenario.fileName,
    "StartTime":scenario.startTime,
    "TimeStamp":new Date(Date.now()),
    "Message":message,
    "TotalDuration":totalDuration,
    "ScenarioStatus":scenarioStatus,
    "EventDuration":eventDuration}]
  );
};
export const LogErrorMock = (
  correlationId:string,
  message: string,
  eventDuration: number,
  totalDuration: number,
  scenarioStatus: boolean
) => {
  console.table([{
    "CorrelationId":correlationId,
    "Message":message,
    "TimeStamp":new Date(Date.now()),
    "TotalDuration":totalDuration,
    "ScenarioStatus":scenarioStatus,
    "EventDuration":eventDuration}]
  );
};

