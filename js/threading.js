/**
 * @param {number} milliseconds
 * @param {any} result
 *
 * @return {Promise<any>}
 */
function sleep(milliseconds, result) {
  return new Promise(resolve => setTimeout(() => resolve(result), milliseconds));
}
