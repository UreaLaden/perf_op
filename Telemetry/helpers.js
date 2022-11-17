"use strict";
exports.__esModule = true;
exports.DevelopmentCodeForTesting = void 0;
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
