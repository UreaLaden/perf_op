import { IScenario } from "./IScenario";
import { Guid } from "guid-typescript";
import { LogErrorMock, LogTelemetryMock } from "./EventLogger";

/**
 * Utility Class for implementing Performance Telemetry
 * 
 */
export class KeyScenarioIndexLogger {
  private scenarioCache: Map<string, IScenario>;
  private timerId: NodeJS.Timer;


  constructor() {
    this.scenarioCache = new Map<string, IScenario>();
    this.timerId = setInterval(this.checkForTimeout.bind(this), 1000); 
  }
  /**
   * Initiate the event and properties to be logged
   * @param {string}scenarioName
   * @param {number}timeout In Milliseconds. Determines when to log a failure if scenario has expired
   * @returns {string} correlationId used to link (success and failure) messages to the scenario telemetry
   */
  startScenario(scenarioName: string, timeout: number): string {
    //generate a new scenario id
    const correlationId: string = Guid.create().toString(); //In prod will use crypto.randomUUID()
    const startTime = new Date(Date.now());
    const timeoutTime = this.CalculateTimeout(startTime, timeout);

    //Create a new IScenario
    const scenario: IScenario = {
      correlationId,
      fileName: "KeyScenarioIndexLogger.ts", // window.location.pathname.split("/").pop(),
      scenarioName,
      startTime,
      lastReportedEventTime: startTime,
      timeoutTime: timeoutTime,
    };
    //add to associated cache
    this.scenarioCache.set(correlationId, scenario);
    //Log initial state to Telemetry
    LogTelemetryMock(
      scenario,
      "Executing Scenario",
      0, //Event Duration
      0, //Total Duration
      null //Scenario status is null since hasn't been completed
    );
   
    return correlationId;
  }
  /**
   * Query the current Scenario Cache for the target scenario
   * @param scenarioName to look for
   * @returns true if correlationId maps to a scenario
   */
  private scenarioExists(correlationId: string): boolean {
    return this.scenarioCache.has(correlationId);
  }

  /**
   * Scenario has successfully completed
   * @param correlationId 
   */
  public logSuccess(correlationId: string): void {
    this.logProperties(
      correlationId,
      "Scenario Completed Successfully",
      true,
      true
    );
  }

  /**
   * Scenario has terminated unsuccessfully
   * @param correlationId 
   */
  public logFailure(correlationId: string): void {
    this.logProperties(correlationId, "Scenario Failed", true, false);
  }

  /**
   * Scenario is still active. Logging custom message and leave scenario running
   * @param correlationId 
   * @param message 
   */
  public logEvent(correlationId: string, message: string) {
    this.logProperties(correlationId, message, false);
  }

  /**
   * Setup properties for logging to telemetry
   * @param {string} correlationId - correlationId of the event
   * @param {string} message - Event text to log
   * @param {boolean} closeScenario - Is the scenario still active
   * @param {boolean} scenarioStatus - True if scenario was a success, false otherwise
   * @returns void
   */
  private logProperties(
    correlationId: string,
    message: string,
    closeScenario: boolean,
    scenarioStatus?: boolean 
  ) {
    //Check if scenario exists
    const scenarioExists: boolean = this.scenarioExists(correlationId);
    if (!scenarioExists) {
      //TODO: Implement this
      LogErrorMock(correlationId,"No existing scenario found matching correlationID",0,0,false);
      return;
    }
    let scenario: IScenario = this.scenarioCache.get(correlationId);
    let duration = this.getDurationFromLastReportedEvent(scenario);
    scenario.lastReportedEventTime = new Date(Date.now()); //update lastReportedEventTime
    let totalDuration = this.calculateDuration(
      scenario.startTime,
      scenario.lastReportedEventTime
    );

    //Is scenario done executing
    if (closeScenario) {
      //TODO: Log into telemetry success/failure event [scenarioStatus]
      if (scenarioStatus) {
        //this.logSuccess(correlationId);

        LogTelemetryMock(
          scenario,
          "Scenario Success",
          duration, //Event Duration
          totalDuration, //Total Duration
          false
        );
      } else {
        LogTelemetryMock(
          scenario,
          "Scenario Failed",
          duration, //Event Duration
          totalDuration, //Total Duration
          false
        );
      }
      //remove from cache
      
      this.scenarioCache.delete(correlationId);
    } else {
      LogTelemetryMock(scenario, message, duration, totalDuration, null);
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
      if (value.timeoutTime <= new Date(Date.now())) {
        //Date is expired
        //TODO: Log scenario expiration [this.logFailure]
        this.logEvent(value.correlationId,"Scenario has reached timeout limit");
        this.logFailure(value.correlationId);
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

/** TODO: Subscenario
 * Start a new scenario
 * Set timeout specific
 * Create async function (setTimeout,)
 * have function call success function on callback after timeout elapsed
 * assert scenario was removed from cache before success was logged
 * Main thread needs to be blocked before async function is handled
 **/

/**
 * StartSubScenario
 * params: parent corelation
 * 
 * parent - corrId
 * ---child -- childCorrId
 * -----nestedChild -- nCorrId
 */
