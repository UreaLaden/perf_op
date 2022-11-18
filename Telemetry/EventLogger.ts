import { IScenarioContext } from "./IScenarioContext";
import { KSIOpCodes } from "./helpers";


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
     export const logPerfEvent = (
      scenario: IScenarioContext,
      message: string,
      scenarioSuccessful: boolean | null,
      traceID: string,
      duration: number,
      opCode: number,
      priority?: any,
  ) => {
      console.table(
          [{
              time_stamp: new Date(Date.now()).toISOString(),
              fileName: scenario.fileName,
              scenarioName: scenario.scenarioName,
              scenarioContextID: scenario.scenarioContextID,
              parentScenarioContextID: scenario.parentScenarioContextID ?? undefined,
              message: message,
              isScenarioSuccessful: scenarioSuccessful,
              traceId: traceID,
              scenarioStartTime: scenario.startTime.toISOString(),
              lastEventStartTime: scenario.lastReportedEventTime.toISOString(),
              opCode: opCode,
              totalScenarioDuration: duration,
          }],
      );
  }

  /**
   * Log a Performance event of any priority.
   * @param {string} scenarioContextID: The Scenario Context ID that trigger the error
   * @param {string} message  -  A string that contains detail of the perf event.
   * @param {boolean} scenarioSuccessful - True if the scenario executed successfully or false it scenario failed
   * @param {string} traceId - Engineers may provide a value here to correlate their scenario with external tables
   * @param {string} parentScenarioContextID [Optional]: The parent scenario Context ID that should be reference. Defaults to null
   * @param priority (optional) specify the priority for sending the event. If not provided, a default priority will be used.
   */
  export const  logPerfError = (
      scenarioContextID: string,
      message: string,
      scenarioSuccessful: boolean,
      traceID: string,
      parentScenarioContextID?: string,
      priority?: any,
  ) => {
      console.table(
          [{
              time_stamp: new Date(Date.now()).toISOString(),
              fileName: null,
              scenarioName: null,
              scenarioContextID: scenarioContextID,
              parentScenarioContextID: parentScenarioContextID ?? null,
              message: message,
              isScenarioSuccessful: scenarioSuccessful,
              traceId: traceID,
              scenarioStartTime: null,
              lastEventStartTime: null,
              opCode: KSIOpCodes.SCENARIO_ERROR,
              totalScenarioDuration: -1,
          }],
      );
  }