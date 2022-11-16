"use strict";
exports.__esModule = true;
var KeyScenarioIndexLogger_1 = require("./KeyScenarioIndexLogger");
var test = function () {
    var chance = Math.random();
    var result = Math.ceil(chance * 7);
    for (var i = 0; i < 10; i++) {
        result += i;
    }
    if (chance > 0.4) {
        return true;
    }
    return false;
};
var Tester = /** @class */ (function () {
    function Tester() {
    }
    Tester.prototype.PopulateResultTest = function () {
        var ksi = new KeyScenarioIndexLogger_1.KeyScenarioIndexLogger(__filename.split("\\").pop());
        var correlationId = ksi.startScenario("Render Main Window", 3000);
        var subCorrelationId = ksi.startSubScenario("Create New User", 2000, correlationId);
        try {
            for (var i = 0; i < 10; i++) {
                var result = test();
                if (i <= 6 && i >= 4 && result === false) {
                    ksi.logFailure(subCorrelationId);
                }
                if (i >= 2 && i < 8 && result === true) {
                    ksi.logEvent(subCorrelationId, result ? "User Creation Successful" : "User Creation Failed");
                    ksi.logSuccess(subCorrelationId);
                    return;
                }
            }
            ksi.logEvent(correlationId, result ? "User was logged in" : "User was not logged in");
            ksi.logSuccess(correlationId);
        }
        catch (_a) {
            ksi.logFailure(correlationId);
            ksi.logFailure(subCorrelationId);
        }
    };
    Tester.prototype.AsyncTest = function () {
        var ksi = new KeyScenarioIndexLogger_1.KeyScenarioIndexLogger(__filename.split("\\").pop());
        var correlationId2 = ksi.startScenario("AsyncTimeout Test", 1000);
        var interval = setTimeout(function () {
            ksi.logSuccess(correlationId2);
        }, 2000); //Calls after 2secs
    };
    return Tester;
}());
var tester = new Tester();
tester.PopulateResultTest();
tester.AsyncTest();
