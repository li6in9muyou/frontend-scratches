/**
 * @param {number} milliseconds
 * @param {any} result
 *
 * @return {Promise<any>}
 */
function resolveAfter(milliseconds, result) {
  return new Promise(resolve => setTimeout(() => resolve(result), milliseconds));
}

function rejectAfter(waitMilliseconds, error) {
  return new Promise((_, reject) => setTimeout(() => reject(error), waitMilliseconds));
}