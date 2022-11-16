export type IScenario = {  //todo: add additional properties as required
    scenarioContextID: string;
    parentScenarioContextID?:string;
    scenarioName: string;
    startTime: Date;
    lastReportedEventTime: Date;  
    timoutThresholdTime: Date;   
    activityId?:string;   
}