'use strict';

function isMongoOId(stringMaybeOid) {
  return /^[a-f\d]{24}/.test(stringMaybeOid);
}

module.exports = {
  isMongoOId
};

//
