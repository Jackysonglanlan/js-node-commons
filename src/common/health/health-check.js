'use strict';

/**
 * Check all items in the checkList, and return heathy result
 *
 * @param {Array} checkList Health check list, item must be a Object:
 *   {
 *     name:'', // the name of the check
 *     checker: () => { } // do the check, return a Promise, resolve(boolean) for the check result, reject(error) otherwise
 *   }
 *
 * @return {Promise} resolve({isAllHealthy: boolean, item.name: item.checker's result, ...}), reject(error) otherwise
 */
const check = (checkList = []) => {
  if (checkList.length === 0) {
    return Promise.resolve();
  }

  // array of Promise.resolve({name, result})
  const wrapedCheckList = checkList.reduce((accu, item) => {
    accu.push(
      new Promise((resolve, reject) => {
        item
          .checker()
          .then(result => {
            resolve({ name: item.name, isOK: !!result });
          })
          .catch(e => {
            resolve({ name: item.name, isOK: false });
          });
      })
    );
    return accu;
  }, []);

  return Promise.all(wrapedCheckList).then(result => {
    const resultPack = result.reduce((acc, item) => {
      acc[item.name] = item.isOK;
      return acc;
    }, {});

    resultPack.isAllHealthy = result.every(item => {
      return item.isOK === true;
    });

    return resultPack;
  });
};

module.exports = {
  check
};

//
