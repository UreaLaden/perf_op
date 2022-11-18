/**
 * Example method for testing KSI Logger
 * @returns true or false
 */
 export const DevelopmentCodeForTesting = () => {
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

  export enum KSIOpCodes {
    SCENARIO_START,
    SCENARIO_END,
    SCENARIO_INTERVAL,
    SCENARIO_ERROR,
}
