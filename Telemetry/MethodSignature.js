"use strict";
exports.__esModule = true;
var KeyScenarioIndexLogger_1 = require("./KeyScenarioIndexLogger");
var helpers_1 = require("./helpers");
// To use the KeyScenarioIndex Logger we first instantiate the Logger
// passing in a string for the current filename. (Filename is logged with telemetry)
// const logger = new KeyScenarioIndexLogger();
var logger = KeyScenarioIndexLogger_1.KeyScenarioIndexLogger.Instance();
var scenarioName = "Render Main Window";
var fileName = __filename.split("\\").pop();
/*To initialize the operation we then need to call startScenario
passing in the Scenario Name and expected timout threshold. The KSI Logger will log a
failure event if this scenario expires.
This will return a scenarioContextID that that can be used to parse Telemetry.
*/
// Situation 1 - Main Scenario Logging Only
var scenarioContextID = logger.startMainScenario(scenarioName, 3000, fileName);
try {
    // Example Production code to be executed
    var result = helpers_1.DevelopmentCodeForTesting();
    // On successful execution, we log an event with the logEvent method. This method accepts
    // a scenerioContextID and a message (This message can be tailored to the specific use case)
    // Additionally we log success using the logSuccess method which accepts the scenarioContextID
    // as input.
    var message = result ? "User was logged in" : "User was not logged in";
    logger.logEvent(scenarioContextID, message);
    logger.logSuccess(scenarioContextID);
}
catch (_a) {
    // In the event there is a failure / error with production code we log a failure with the logFailure
    // method. Accepts only the scenarioContextID.
    logger.logFailure(scenarioContextID);
}
//Situation 2 - Sub Scenario Logging
// Using this framework we are able to log subprocesses within the context
// of the main scenario. For example, if there were certain conditions that 
// needed to be met before our main window could be rendered. ie. Is the user
// required to be logged in? We are then able to follow the sequence of events
// via telemetry while maintaining a reference to the mainScenarioContext.
var mainScenarioName = "Render Secondary Window";
var mainScenarioContextID = logger.startMainScenario(mainScenarioName, 3000, fileName);
//To initiate the sub scenario we called the startSubScenario method. This time passing in the 
//unique scenario name, timeout threshold and the mainScenarioContextID 
//(If ommited we generate a unique GUID. The GUID must be unique)
var subScenarioName = "Create New User";
var subScenarioContexID = logger.startSubScenario(mainScenarioName, 2000, fileName, mainScenarioContextID);
try {
    // Example Production code to be executed
    var result = helpers_1.DevelopmentCodeForTesting();
    var i = Math.floor(Math.random() * 10);
    // The process for logging events remains the same with the only
    // difference being the subScenarioContextID that is passed into our log methods
    if (i <= 6 && i >= 4 && result === false) {
        logger.logFailure(subScenarioContexID);
    }
    else {
        var subMessage = result ? "User Creation Successful" : "User Creation Failed";
        logger.logEvent(subScenarioContexID, subMessage);
        logger.logSuccess(subScenarioContexID);
    }
    var message = result ? "User was logged in" : "User was not logged in";
    logger.logEvent(mainScenarioContextID, message);
    logger.logSuccess(mainScenarioContextID);
}
catch (_b) {
    // In the event there is a failure / error with production code we log a failure with the logFailure
    // method.This method accepts only the scenarioContextID.
    logger.logFailure(mainScenarioContextID);
}
