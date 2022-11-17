import { IScenarioContext } from "./IScenarioContext";
import { Guid } from "guid-typescript";
import { LogErrorMock, LogTelemetryMock } from "./EventLogger";

/**
 * Utility Class for implementing Performance Telemetry
 *
 */
export class KeyScenarioIndexLogger {
  private scenarioCache: Map<string, IScenarioContext>;
  private timerId: NodeJS.Timer;
  private _traceID:string;

  private static _Instance:KeyScenarioIndexLogger ;

  public static Instance(){
    return this._Instance || (this._Instance = new this())
  }

  constructor() {
    this.scenarioCache = new Map<string, IScenarioContext>();
    this._traceID = Guid.create().toString();
    this.timerId = setInterval(this.checkForTimeout.bind(this), 1000);
  }
  /**
   * Initiate the event and properties to be logged
   * @param {string}scenarioName - Name of the operation to be conducted
   * @param {number}timeout In Milliseconds. Determines when to log a failure if scenario has expired
   * @param {string} File name where scenario is located
   * @returns {string} scenarioContextID used to link (success and failure) messages to the scenario telemetry
   */
  public startMainScenario(
    scenarioName: string,
    timeout: number,
    fileName:string,
  ): string {
    //generate a new scenario id
    //If dev inputs already existing correlationId how should we handle?
    //Rename correlationId to scenarioContextID
    const scenarioContextID: string = Guid.create().toString(); //In prod will use crypto.randomUUID()
    const startTime: Date = new Date(Date.now());
    const timeoutTime: Date = this.CalculateTimeout(startTime, timeout);

    //Create a new IScenarioContext
    const scenario: IScenarioContext = {
      scenarioContextID,
      scenarioName,
      startTime,
      lastReportedEventTime: startTime,
      timoutThresholdTime: timeoutTime,
      fileName:fileName,
    };
    //add to associated cache
    this.scenarioCache.set(scenarioContextID, scenario);
    //Log initial state to Telemetry
    LogTelemetryMock(
      scenario,      
      "Executing Scenario",
      null, //Scenario status is null since hasn't been completed
      this._traceID
    );
    return scenarioContextID;
  }

  /**
   * Initiate a nested event and properties to be logged
   * @param {string}scenarioName - Name of the operation to be conducted
   * @param {number} timeout In Milliseconds. Determines when to log a failure if scenario has expired
   * @param {string} File name where sub event was executed
   * @param {string} parentCorrelation correlationId. 
   * @returns
   */
  public startSubScenario(
    scenarioName: string,
    timeout: number,
    fileName:string,
    parentScenarioContextID?: string
  ): string {
    const scenarioContextID: string = Guid.create().toString(); //In prod will use crypto.randomUUID()
    const startTime: Date = new Date(Date.now());
    const timeoutTime: Date = this.CalculateTimeout(startTime, timeout);

    const scenario: IScenarioContext = {
      scenarioContextID,
      parentScenarioContextID: parentScenarioContextID ,
      scenarioName,
      startTime,
      timoutThresholdTime: timeoutTime,
      lastReportedEventTime: startTime,
      fileName:fileName,
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
  public logSuccess(scenarioName:string,scenarioContextID: string): void {
    this.logProperties(
      scenarioName,
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
  public logFailure(scenarioName:string,scenarioContextID: string): void {
    this.logProperties(scenarioName,scenarioContextID, "Scenario Failed", true, false);
  }

  /**
   * Scenario is still active. Logging custom message and leave scenario running
   * @param correlationId
   * @param message
   */
  public logEvent(scenarioName:string,scenarioContextID: string, message: string) {
    this.logProperties(scenarioName,scenarioContextID, message, false);
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
    scenarioName:string,
    scenarioContextID: string,
    message: string,
    closeScenario: boolean,
    scenarioSuccessful?: boolean
  ) {
    //Check if scenario exists
    const scenarioExists: boolean = this.scenarioExists(scenarioContextID);
    if (!scenarioExists) {
      this.LogErrorMock(
        scenarioContextID,
        "No existing scenario found matching scenarioContextID",
        false,
        this._traceID
      );
      return;
    }
    let scenario: IScenarioContext = this.scenarioCache.get(scenarioContextID);
    

    //Is scenario done executing
    if (closeScenario) {
      //TODO: Log into telemetry success/failure event [scenarioSuccessful]
      if (scenarioSuccessful) {
        //this.logSuccess(correlationId);

        this.LogTelemetryMock(
          scenario,
          "Scenario Success",
          true,
          this._traceID
        );
      } else {
        this.LogTelemetryMock(
          scenario,
          "Scenario Failed",
          false,
          this._traceID
        );
      }
      //remove from cache

      this.scenarioCache.delete(scenarioContextID);
    } else {
      this.LogTelemetryMock(scenario, message,null,this._traceID);
    }
  }

  /**
   * Determines the duration from previous scenario to current time.
   * @param scenario
   * @returns
   */
  private getDurationFromLastReportedEvent(scenario: IScenarioContext): number {
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
    this.scenarioCache.forEach((value: IScenarioContext, key: string) => {
      if (value.timoutThresholdTime <= new Date(Date.now())) {
        //Date is expired
        //TODO: Log scenario expiration [this.logFailure]
        this.logEvent(
          value.scenarioName,
          value.scenarioContextID,
          "Scenario has reached timeout limit"
        );
        this.logFailure(value.scenarioName,value.scenarioContextID);
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

  private LogTelemetryMock = (
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
  
  private LogErrorMock = (
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
  
}
