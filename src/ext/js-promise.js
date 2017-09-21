//
'use strict';

/////////// Promise ///////////

/**
 * Execute promises serially.
 *
 * @param promiseList [Promise1, Promise2, ...]
 */
Promise.serialAll = function(promiseList) {
  return promiseList.reduce((start, promise) => {
    return start.return(promise);
  }, Promise.resolve());
};

//
