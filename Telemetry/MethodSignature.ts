import { KeyScenarioIndexLogger } from "./KeyScenarioIndexLogger";

/**
 * Example method for testing KSI Logger
 * @returns true or false
 */
const DevelopmentCodeForTesting = () => {
  let chance = Math.random();
  let result: number = Math.ceil(chance * 7);
  for (let i = 0; i < 10; i++) {
    result += i;
  }
  if (chance > 0.4) {
    return true;
  }
  return false;
};
let scenarioName = "Render Main Window";
const fileName = __filename.split("\\").pop();
// To use the KeyScenarioIndex Logger we first instantiate the Logger
// passing in a string for the current filename. (Filename is logged with telemetry)
// const logger = new KeyScenarioIndexLogger();
const logger = KeyScenarioIndexLogger.Instance();

/*To initialize the operation we then need to call startScenario 
passing in the Scenario Name and expected timout threshold. The KSI Logger will log a 
failure event if this scenario expires.
This will return a scenarioContextID that that can be used to parse Telemetry.
*/

// Situation 1 - Main Scenario Logging Only
let scenarioContextID = logger.startScenario(scenarioName, 3000,fileName);
try {
  // Example Production code to be executed
  //for (let i = 0; i < 10; i++) {
    var result = DevelopmentCodeForTesting();

    // On successful execution, we log an event with the logEvent method. This method accepts
    // a scenerioContextID and a message (This message can be tailored to the specific use case)
    // Additionally we log success using the logSuccess method which accepts the scenarioContextID
    // as input.

    logger.logEvent(
        scenarioName,
      scenarioContextID,
      result ? "User was logged in" : "User was not logged in"
    );
    logger.logSuccess(scenarioName,scenarioContextID);
  //}
} catch {
    // In the event there is a failure / error with production code we log a failure with the logFailure
    // method. Accepts only the scenarioContextID.
  logger.logFailure(scenarioName,scenarioContextID);
}

//Situation 2 - Sub Scenario Logging
// Using this framework we are able to log subprocesses within the context
// of the main scenario. For example, if there were certain conditions that 
// needed to be met before our main window could be rendered. ie. Is the user
// required to be logged in? We are then able to follow the sequence of events
// via telemetry while maintaining a reference to the mainScenarioContext.

scenarioName = "Render Secondary Window";
let mainScenarioContextID = logger.startSubScenario(scenarioName, 3000,fileName,scenarioContextID);

//To initiate the sub scenario we called the startSubScenario method. This time passing in the 
//unique scenario name, timeout threshold and the mainScenarioContextID 
//(If ommited we generate a unique GUID. The GUID must be unique)
const subScenarioName = "Create New User";
let subScenarioContexID = logger.startSubScenario(subScenarioName,2000,fileName,mainScenarioContextID);

try {
  // Example Production code to be executed
  //for (let i = 0; i < 10; i++) {
    var result = DevelopmentCodeForTesting();
    let i = Math.floor(Math.random() * 10)
    // The process for logging events remains the same with the only
    // difference being the subScenarioContextID that is passed into our log methods
    if(i <= 6 && i >= 4 && result === false ){
        logger.logFailure(subScenarioName,subScenarioContexID);
    }
    else{
      logger.logEvent(subScenarioName,subScenarioContexID,
        result ? "User Creation Successful" : "User Creation Failed");
      logger.logSuccess(subScenarioName,subScenarioContexID);
    }

    logger.logEvent(
        scenarioName,
        mainScenarioContextID,
      result ? "User was logged in" : "User was not logged in"
    );
    logger.logSuccess(subScenarioName,mainScenarioContextID);
  //}
} catch {
    // In the event there is a failure / error with production code we log a failure with the logFailure
    // method.This method accepts only the scenarioContextID.
  logger.logFailure(subScenarioName,mainScenarioContextID);
}

