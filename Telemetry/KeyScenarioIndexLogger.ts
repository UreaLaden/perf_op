import { IScenario } from "./IScenario";
import { Guid } from "guid-typescript";
import { LogErrorMock, LogTelemetryMock } from "./EventLogger";
import { start } from "repl";

/**
 * Utility Class for implementing Performance Telemetry
 *
 */
export class KeyScenarioIndexLogger {
  private scenarioCache: Map<string, IScenario>;
  private timerId: NodeJS.Timer;
  private _fileName:string;

  constructor(fileName:string) {
    this.scenarioCache = new Map<string, IScenario>();
    this.timerId = setInterval(this.checkForTimeout.bind(this), 1000);
    this._fileName = fileName;
  }
  /**
   * Initiate the event and properties to be logged
   * @param {string}scenarioName - Name of the operation to be conducted
   * @param {number}timeout In Milliseconds. Determines when to log a failure if scenario has expired
   * @returns {string} scenarioContextID used to link (success and failure) messages to the scenario telemetry
   */
  public startScenario(
    scenarioName: string,
    timeout: number,
    scenarioContextID?: string
  ): string {
    //generate a new scenario id
    //If dev inputs already existing correlationId how should we handle?
    //Rename correlationId to scenarioContextID
    const correlationId: string =
    scenarioContextID ?? Guid.create().toString(); //In prod will use crypto.randomUUID()
    const startTime: Date = new Date(Date.now());
    const timeoutTime: Date = this.CalculateTimeout(startTime, timeout);

    //Create a new IScenario
    const scenario: IScenario = {
      scenarioContextID,
      scenarioName,
      startTime,
      lastReportedEventTime: startTime,
      timoutThresholdTime: timeoutTime,
    };
    //add to associated cache
    this.scenarioCache.set(correlationId, scenario);
    //Log initial state to Telemetry
    LogTelemetryMock(
      scenario,      
      "Executing Scenario",
      this._fileName,
      0, //Event Duration
      0, //Total Duration
      null //Scenario status is null since hasn't been completed
    );
    return correlationId;
  }

  /**
   * Initiate a nested event and properties to be logged
   * @param {string}scenarioName - Name of the operation to be conducted
   * @param {number} timeout In Milliseconds. Determines when to log a failure if scenario has expired
   * @param {string} parentCorrelation correlationId. 
   * @returns
   */
  public startSubScenario(
    scenarioName: string,
    timeout: number,
    parentScenarioContextID?: string
  ): string {
    const scenarioContextID: string = Guid.create().toString(); //In prod will use crypto.randomUUID()
    const startTime: Date = new Date(Date.now());
    const timeoutTime: Date = this.CalculateTimeout(startTime, timeout);

    const scenario: IScenario = {
      scenarioContextID,
      parentScenarioContextID: parentScenarioContextID ,
      scenarioName,
      startTime,
      lastReportedEventTime: startTime,
      timoutThresholdTime: timeoutTime,
    };
    this.scenarioCache.set(scenarioContextID, scenario);
    return scenarioContextID;
  }

  /**
   * Query the current Scenario Cache for the target scenario
   * @param scenarioName to look for
   * @returns true if correlationId maps to a scenario
   */
  private scenarioExists(scenarioContextID: string): boolean {
    return this.scenarioCache.has(scenarioContextID);
  }

  /**
   * Scenario has successfully completed
   * @param correlationId
   */
  public logSuccess(scenarioContextID: string): void {
    this.logProperties(
      scenarioContextID,
      "Scenario Completed Successfully",
      true,
      true
    );
  }

  /**
   * Scenario has terminated unsuccessfully
   * @param correlationId
   */
  public logFailure(scenarioContextID: string): void {
    this.logProperties(scenarioContextID, "Scenario Failed", true, false);
  }

  /**
   * Scenario is still active. Logging custom message and leave scenario running
   * @param correlationId
   * @param message
   */
  public logEvent(scenarioContextID: string, message: string) {
    this.logProperties(scenarioContextID, message, false);
  }

  /**
   * Setup properties for logging to telemetry
   * @param {string} correlationId - correlationId of the event
   * @param {string} message - Event text to log
   * @param {boolean} closeScenario - Is the scenario still active
   * @param {boolean} scenarioSuccessful - True if scenario was a success, false otherwise
   * @returns void
   */
  private logProperties(
    scenarioContextID: string,
    message: string,
    closeScenario: boolean,
    scenarioSuccessful?: boolean
  ) {
    //Check if scenario exists
    const scenarioExists: boolean = this.scenarioExists(scenarioContextID);
    if (!scenarioExists) {
      //TODO: Implement this
      LogErrorMock(
        scenarioContextID,
        this._fileName,
        "No existing scenario found matching scenarioContextID",
        0,
        0,
        false
      );
      return;
    }
    let scenario: IScenario = this.scenarioCache.get(scenarioContextID);
    let duration = this.getDurationFromLastReportedEvent(scenario);
    scenario.lastReportedEventTime = new Date(Date.now()); //update lastReportedEventTime
    let totalDuration = this.calculateDuration(
      scenario.startTime,
      scenario.lastReportedEventTime
    );

    //Is scenario done executing
    if (closeScenario) {
      //TODO: Log into telemetry success/failure event [scenarioSuccessful]
      if (scenarioSuccessful) {
        //this.logSuccess(correlationId);

        LogTelemetryMock(
          scenario,
          "Scenario Success",
          this._fileName,
          duration, //Event Duration
          totalDuration, //Total Duration
          true,
        );
      } else {
        LogTelemetryMock(
          scenario,
          "Scenario Failed",
          this._fileName,
          duration, //Event Duration
          totalDuration, //Total Duration
          false
        );
      }
      //remove from cache

      this.scenarioCache.delete(scenarioContextID);
    } else {
      LogTelemetryMock(scenario, message,this._fileName, duration, totalDuration, null);
    }
  }

  /**
   * Determines the duration from previous scenario to current time.
   * @param scenario
   * @returns
   */
  private getDurationFromLastReportedEvent(scenario: IScenario): number {
    return this.calculateDuration(
      scenario.lastReportedEventTime,
      new Date(Date.now())
    );
  }
  /**
   * Helper function to calculate lapsed time between to Datetime Objects
   * @param {Date} begin - Last Reported Event time
   * @param {Date} end - Current Timestamp
   * @returns
   */
  private calculateDuration(begin: Date, end: Date): number {
    const min: Date = begin < end ? begin : end;
    const max: Date = begin > end ? begin : end;
    return Math.round(((max.getTime() - min.getTime()) / 1000) * 1000) / 1000;
  }
  /**
   * Iterate through the associated cache to determine if any scenarios have expired
   * @returns
   */
  private checkForTimeout(): void {
    //This method is hitting an infinite loop. Investigate
    //Go through all of the current scenarios
    if (!this.scenarioCache.size) return;
    this.scenarioCache.forEach((value: IScenario, key: string) => {
      if (value.timoutThresholdTime <= new Date(Date.now())) {
        //Date is expired
        //TODO: Log scenario expiration [this.logFailure]
        this.logEvent(
          value.scenarioContextID,
          "Scenario has reached timeout limit"
        );
        this.logFailure(value.scenarioContextID);
      }
    });
  }

  /**
   * Accepts a Date object incrememented by a provided timeout in milliseconds
   * @param {Date} time
   * @param {Date} timoutInMs
   * @returns {Date}
   */
  private CalculateTimeout(time: Date, timoutInMs: number): Date {
    let newDate: Date = new Date();
    newDate.setTime(time.getTime() + timoutInMs);
    return newDate;
  }
}
