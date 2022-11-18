"use strict";
exports.__esModule = true;
var KeyScenarioIndexLogger_1 = require("./KeyScenarioIndexLogger");
var kLogger = KeyScenarioIndexLogger_1.KeyScenarioIndexLogger.Instance();
var scenarioContextID = kLogger.startMainScenario("Async Test 1", 30 * 1000, "AsyncTest.ts");
var myPromise = new Promise(function (resolve, reject) {
    //log event here promise started
    kLogger.logEvent(scenarioContextID, "Promise Started");
    setTimeout(function () {
        //log event here
        kLogger.logEvent(scenarioContextID, "Async Log on Separate Thread");
        resolve("foo");
    }, 30 * 1000);
});
myPromise
    .then(function (message) {
    //log success here
    kLogger.logEvent(scenarioContextID, "Async Test Complete");
    kLogger.logSuccess(scenarioContextID);
})["catch"](function (error) {
    kLogger.logEvent(scenarioContextID, "Something went wrong: " + error);
    kLogger.logFailure(scenarioContextID);
});
//log event here that we got to this point first
kLogger.logEvent(scenarioContextID, "Synchronous Process Complete on main thread");
