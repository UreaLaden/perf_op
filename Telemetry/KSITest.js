"use strict";
exports.__esModule = true;
var KeyScenarioIndexLogger_1 = require("./KeyScenarioIndexLogger");
var test = function () {
    var chance = Math.random();
    var result = Math.ceil(chance * 7);
    for (var i = 0; i < 100000; i++) {
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
        var ksi = new KeyScenarioIndexLogger_1.KeyScenarioIndexLogger();
        var correlationId = ksi.startScenario("Render Main Window", 3000);
        try {
            var result = test();
            if (result) {
                ksi.logEvent(correlationId, "User was logged in");
            }
            else {
                ksi.logEvent(correlationId, "User was not logged in");
            }
            ksi.logSuccess(correlationId);
        }
        catch (_a) {
            ksi.logFailure(correlationId);
        }
        var correlationId2 = ksi.startScenario("AsyncTimeout Test", 1000);
        var interval = setInterval(function () {
            console.log('Corr: ' + correlationId2);
            ksi.logSuccess(correlationId2);
        }, 2000); //Calls after 2secs
    };
    return Tester;
}());
var tester = new Tester();
tester.PopulateResultTest();
