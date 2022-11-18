import { KeyScenarioIndexLogger } from "./KeyScenarioIndexLogger";

const kLogger = KeyScenarioIndexLogger.Instance();
const scenarioContextID = kLogger.startMainScenario(
  "Async Test 1",
  30 * 1000,
  "AsyncTest.ts"
);

const myPromise = new Promise((resolve, reject) => {
  //log event here promise started
  kLogger.logEvent(scenarioContextID, "Promise Started");
  setTimeout(() => {
    //log event here
    kLogger.logEvent(scenarioContextID, "Async Log on Separate Thread");
    resolve("foo");
  }, 30 * 1000);
});

myPromise
  .then((message) => {
    //log success here
    kLogger.logEvent(scenarioContextID, "Async Test Complete");
    kLogger.logSuccess(scenarioContextID);
  })
  .catch((error) => {
    kLogger.logEvent(scenarioContextID, `Something went wrong: ${error}`);
    kLogger.logFailure(scenarioContextID);
  });

//log event here that we got to this point first
kLogger.logEvent(scenarioContextID,"Synchronous Process Complete on main thread");