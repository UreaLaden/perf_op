export type IScenario = {  //todo: add additional properties as required
    correlationId: string;
    fileName: string;
    scenarioName: string;
    startTime: Date;
    lastReportedEventTime: Date;  
    timeoutTime: Date;      
}