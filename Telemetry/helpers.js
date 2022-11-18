"use strict";
exports.__esModule = true;
exports.KSIOpCodes = exports.DevelopmentCodeForTesting = void 0;
/**
 * Example method for testing KSI Logger
 * @returns true or false
 */
var DevelopmentCodeForTesting = function () {
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
exports.DevelopmentCodeForTesting = DevelopmentCodeForTesting;
var KSIOpCodes;
(function (KSIOpCodes) {
    KSIOpCodes[KSIOpCodes["SCENARIO_START"] = 0] = "SCENARIO_START";
    KSIOpCodes[KSIOpCodes["SCENARIO_END"] = 1] = "SCENARIO_END";
    KSIOpCodes[KSIOpCodes["SCENARIO_INTERVAL"] = 2] = "SCENARIO_INTERVAL";
    KSIOpCodes[KSIOpCodes["SCENARIO_ERROR"] = 3] = "SCENARIO_ERROR";
})(KSIOpCodes = exports.KSIOpCodes || (exports.KSIOpCodes = {}));
