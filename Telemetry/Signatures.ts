export class KeyScenarioIndexLogger {

    private scenarioCache: Map<string, IScenarioContext>;
    private timerId: NodeJS.Timer;
    private static _Instance: KeyScenarioIndexLogger;
    
    //Trace ID remains the same throughout the KeyScenarioIndexLogger Lyfe Cycle
    private traceID: string;
    /* 
     * Instantiating a global static instance to manage scenarios across multiple files. 
     */
    public static Instance() { }

    /* 
     * Instantiates a cache to store Scenarios 
     * Sets a timer to continually check the scenarios within the cache for expiry 
     * Stores the input file name for Telemetry logging later. 
     * Store traceID which is unique identifier 
     */
    constructor(){}

    /**1 
     * Phase1 
     * Initiates the event and properties to be logged. 
     * @param   {string} scenarioName - Name of the operation to be conducted 
     * @param   {number} timeout In Milliseconds. Determines when to log a failure if scenario has expired 
     * @param   {string} fileName where scenario is located 
     * @returns {string} ScenarioContextID [Unique identifier], for each running scenario instance,  used to trace the entire Scenario from start to finish.      
     */
    public startMainScenario(scenarioName: string, timeout: number, fileName: string) : scenarioContextID {}

    /** 
     * Initiate a nested scenario and properties to be logged 
     * @param   {string} scenarioName - Name of the operation to be conducted 
     * @param   {string} subScenarioName - Name of the operation to be conducted 
     * @param   {number} timeout In Milliseconds. Determines when to log a failure if scenario has expired 
     * @param   {string} filename name of the file where scenario is located 
     * @param   {string} parentScenarioContextID to be used correlating with parent scenario 
     * @returns {string} scenarioContextID 
     */
    public startSubScenario(scenarioName: string, timeout: number, filename?: string, parentScenarioContextID?: string) : scenarioContextID {}

    /** 
     * Scenario has successfully completed. This is required to differentiate between  
     * actively running scenarios since the logger will support multiple running scenarios. 
     * @param {string} scenarioName - Name of the operation to be conducted 
     * @param {string} filename name of the file where scenario is located 
     * @param {string} scenarioContextID 
     */
    public logSuccess(scenarioName: string, scenarioContextID: string, filename?: string): void {}

    /**  
     * Scenario has terminated unsuccessfully 
     * @param {string} scenarioName - Name of the operation to be conducted 
     * @param {string} scenarioContextID 
     * @param {string} filename name of the file where scenario is located 
     */
    public logFailure(scenarioName: string, scenarioContextID: string): void {}

    /** 
     * Scenario is still active. Log custom message and leave scenario running 
     * @param {string} scenarioName - Name of the operation to be conducted 
     * @param {string} scenarioContextID 
     * @param {string} message 
     */
    public logEvent(scenarioName: string, scenarioContextID: string, message: string, filename?: string): void {}
} 