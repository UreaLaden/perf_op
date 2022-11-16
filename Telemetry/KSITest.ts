import { symlink } from "fs";
import { KeyScenarioIndexLogger } from "./KeyScenarioIndexLogger";

const test = () => {
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

class Tester {
  public PopulateResultTest() {
    let ksi = new KeyScenarioIndexLogger(__filename.split("\\").pop());
    let correlationId = ksi.startScenario("Render Main Window", 3000);
    let subCorrelationId = ksi.startSubScenario("Create New User",2000,correlationId);
    try {
      for(let i=0;i<10;i++){        
        var result = test();
        
        if(i <= 6 && i >= 4 && result === false ){
            ksi.logFailure(subCorrelationId);
        }
        if(i >= 2 && i < 8 && result === true ){
          ksi.logEvent(subCorrelationId,
            result ? "User Creation Successful" : "User Creation Failed");
          ksi.logSuccess(subCorrelationId);
          return;
        }
      }

      ksi.logEvent(
        correlationId,
        result ? "User was logged in" : "User was not logged in"
      );
      ksi.logSuccess(correlationId);
    } catch {
      ksi.logFailure(correlationId);
      ksi.logFailure(subCorrelationId);
    }

  }
  public AsyncTest(){
    let ksi = new KeyScenarioIndexLogger(__filename.split("\\").pop());    
    let correlationId2 = ksi.startScenario("AsyncTimeout Test", 1000);
    let interval = setTimeout(() => {
      ksi.logSuccess(correlationId2);
    }, 2000); //Calls after 2secs
  }
}

let tester = new Tester();

tester.PopulateResultTest();
tester.AsyncTest();
