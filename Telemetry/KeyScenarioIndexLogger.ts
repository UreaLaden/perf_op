import { IScenarioContext } from "./IScenarioContext";
import { Guid } from "guid-typescript";
import { KSIOpCodes } from "./helpers";
import { logPerfEvent,logPerfError } from "./EventLogger";

/**
 * Utility Class for implementing Performance Telemetry
 *
 */
export class KeyScenarioIndexLogger {
    private scenarioCache: Map<string, IScenarioContext>;
    private timerId: NodeJS.Timer;
    private _traceID: string;

    private static _Instance: KeyScenarioIndexLogger;

    public static Instance() {
        return this._Instance || (this._Instance = new this());
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
    public startMainScenario(scenarioName: string, timeout: number, fileName: string): string {
        //generate a new scenario id
        const scenarioContextID: string = Guid.create().toString();
        const startTime: Date = new Date(Date.now());
        const timeoutTime: Date = this.CalculateTimeout(startTime, timeout);

        //Create a new IScenarioContext
        const scenario: IScenarioContext = {
            scenarioContextID,
            scenarioName,
            startTime,
            lastReportedEventTime: startTime,
            timoutThresholdTime: timeoutTime,
            fileName: fileName,
        };
        //add to associated cache
        this.scenarioCache.set(scenarioContextID, scenario);
        //Log initial state to Telemetry
        logPerfEvent(
            scenario,
            `Executing Scenario: ${scenarioName}`,
            null, //Scenario status is null since hasn't been completed
            this._traceID,
            0,
            KSIOpCodes.SCENARIO_START,
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
        fileName: string,
        parentScenarioContextID?: string,
    ): string {
        const scenarioContextID: string = Guid.create().toString();
        const startTime: Date = new Date(Date.now());
        const timeoutTime: Date = this.CalculateTimeout(startTime, timeout);

        const scenario: IScenarioContext = {
            scenarioContextID,
            parentScenarioContextID: parentScenarioContextID,
            scenarioName,
            startTime,
            lastReportedEventTime: startTime,
            timoutThresholdTime: timeoutTime,
            fileName: fileName,
        };
        this.scenarioCache.set(scenarioContextID, scenario);
        //Log initial state to Telemetry
        logPerfEvent(
            scenario,
            `Executing Sub Scenario: ${scenarioName}`,
            null, //Scenario status is null since hasn't been completed
            this._traceID,
            0,
            KSIOpCodes.SCENARIO_START,
        );
        return scenarioContextID;
    }

    /**
     * Query the current Scenario Cache for the target scenario
     * @param scenarioContextID
     * @returns true if scenarioContextID maps to a scenario
     */
    private scenarioExists(scenarioContextID: string): boolean {
        return this.scenarioCache.has(scenarioContextID);
    }

    /**
     * Scenario has successfully completed
     * @param {string} scenarioContextID
     */
    public logSuccess(scenarioContextID: string): void {
        this.logProperties(scenarioContextID, `Completed Successfully`, true, true);
    }

    /**
     * Scenario has terminated unsuccessfully
     * @param {string} scenarioContextID
     */
    public logFailure(scenarioContextID: string): void {
        this.logProperties(scenarioContextID, `Failed`, true, false);
    }

    /**
     * Scenario is still active. Logging custom message and leave scenario running
     * @param {string} scenarioContextID
     * @param {string} message
     */
    public logEvent(scenarioContextID: string, message: string) {
        this.logProperties(scenarioContextID, message, false);
    }

    /**
     * Setup properties for logging to telemetry
     * @param {string}  scenarioContextID - scenarioContextID of the event
     * @param {string}  message - Event text to log
     * @param {boolean} closeScenario - Is the scenario still active
     * @param {boolean} scenarioSuccessful - True if scenario was a success, false otherwise
     */
    private logProperties(
        scenarioContextID: string,
        message: string,
        closeScenario: boolean,
        scenarioSuccessful?: boolean,
    ) {
        //Check if scenario exists
        const scenarioExists: boolean = this.scenarioExists(scenarioContextID);
        if (!scenarioExists) {
            logPerfError(
                scenarioContextID,
                "No existing scenario found matching scenarioContextID",
                false,
                this._traceID,
            );
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const scenario: IScenarioContext = this.scenarioCache.get(scenarioContextID)!;
        scenario.lastReportedEventTime = new Date(Date.now());
        const totalScenarioDuration = this.calculateDuration(scenario.startTime, scenario.lastReportedEventTime);

        //Is scenario done executing
        if (closeScenario) {
            if (scenarioSuccessful) {
                logPerfEvent(
                    scenario,
                    message,
                    true,
                    this._traceID,
                    totalScenarioDuration,
                    KSIOpCodes.SCENARIO_END,
                );
            } else {
                logPerfEvent(
                    scenario,
                    message,
                    false,
                    this._traceID,
                    totalScenarioDuration,
                    KSIOpCodes.SCENARIO_END,
                );
            }
            //remove from cache
            this.scenarioCache.delete(scenarioContextID);
        } else {
            logPerfEvent(
                scenario,
                message,
                null,
                this._traceID,
                totalScenarioDuration,
                KSIOpCodes.SCENARIO_INTERVAL,
            );
        }
    }

    /**
     * Iterate through the associated cache to determine if any scenarios have expired
     */
    private checkForTimeout(): void {
        //This method is hitting an infinite loop. Investigate
        //Go through all of the current scenarios
        if (!this.scenarioCache.size) return;
        this.scenarioCache.forEach((value: IScenarioContext) => {
            if (value.timoutThresholdTime <= new Date(Date.now())) {
                //Date is expired
                this.logEvent(value.scenarioContextID, "Scenario has reached timeout limit");
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
        const newDate: Date = new Date();
        newDate.setTime(time.getTime() + timoutInMs);
        return newDate;
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
}
