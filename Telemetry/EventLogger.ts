import { IScenario } from "./IScenario";

export const LogTelemetryMock = (
  scenario: IScenario,
  message: string,
  fileName:string,
  eventDuration: number,
  totalDuration: number,
  scenarioSuccessful: boolean,
  activityId?:string,
) => {
  console.table([{
    "TimeStamp":new Date(Date.now()),
    "FileName":fileName,
    "ScenarioName":scenario.scenarioName,
    "scenarioContextID":scenario.scenarioContextID,
    "ParentScenarioContextID": scenario.parentScenarioContextID ?? null,
    "ScenarioStartTime ":scenario.startTime,
    "Message":message,
    "DurationFromStart":totalDuration,
    "IsScenarioSuccessful":scenarioSuccessful,
    "DurationFromLastEvent":eventDuration,
    "ActivityId":activityId}]
  );
};
export const LogErrorMock = (
  scenarioContextID:string,
  fileName:string,
  message: string,
  eventDuration: number,
  totalDuration: number,
  scenarioSuccessful: boolean,
  parentScenarioContextID?:string,
  activityId?:string
) => {
  console.table([{
    "TimeStamp":new Date(Date.now()),
    "FileName":fileName,
    "scenarioContextID":scenarioContextID,
    "ParentScenarioContextID": parentScenarioContextID ?? null,
    "Message":message,
    "DurationFromStart":totalDuration,
    "IsScenarioSuccessful":scenarioSuccessful,
    "DurationFromLastEvent":eventDuration,
    "ActivityId":activityId}]
  );
};

