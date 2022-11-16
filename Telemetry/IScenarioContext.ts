export type IScenarioContext = {  //todo: add additional properties as required
    scenarioContextID: string;
    parentScenarioContextID?:string;
    scenarioName: string;
    timoutThresholdTime: Date;  
    startTime: Date; 
    lastReportedEventTime: Date; 
    fileName?:string; 
}