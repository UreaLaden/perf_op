import { IScenarioContext } from "./IScenarioContext";

export const LogTelemetryMock = (
  scenario: IScenarioContext,
  message: string,
  scenarioSuccessful: boolean,
  traceID:string,
) => {
  console.table([{
    "TimeStamp":new Date(Date.now()),
    "FileName":scenario.fileName,
    "ScenarioName":scenario.scenarioName,
    "scenarioContextID":scenario.scenarioContextID,
    "ParentScenarioContextID": scenario.parentScenarioContextID ?? null,
    "Message":message,
    "IsScenarioSuccessful":scenarioSuccessful,
    "TraceID":traceID}]
  );
};

export const LogErrorMock = (
  scenarioContextID:string,
  message: string,
  scenarioSuccessful: boolean,
  traceID:string,
  parentScenarioContextID?:string
) => {
  console.table([{
    "TimeStamp":new Date(Date.now()),
    "FileName":null,
    "ScenarioName":null,
    "scenarioContextID":scenarioContextID,
    "ParentScenarioContextID": parentScenarioContextID ?? null,
    "Message":message,
    "IsScenarioSuccessful":scenarioSuccessful,
    "TraceID":traceID}]
  );
};

