import { KeyScenarioIndexLogger } from "./KeyScenarioIndexLogger";

const test = () => {
  let chance = Math.random();
  let result: number = Math.ceil(chance * 7);
  for (let i = 0; i < 100000; i++) {
    result += i;
  }
  if (chance > 0.4) {
    return true;
  }
  return false;
};

class Tester {
  public PopulateResultTest() {
    let ksi = new KeyScenarioIndexLogger();

    let correlationId = ksi.startScenario("Render Main Window", 3000);
    try {
      var result = test();

      ksi.logEvent(
        correlationId,
        result ? "User was logged in" : "User was not logged in"
      );
      ksi.logSuccess(correlationId);
    } catch {
      ksi.logFailure(correlationId);
    }

    let correlationId2 = ksi.startScenario("AsyncTimeout Test", 1000);
    let interval = setTimeout(() => {
      ksi.logSuccess(correlationId2);
    }, 2000); //Calls after 2secs
  }
}

let tester = new Tester();
tester.PopulateResultTest();
