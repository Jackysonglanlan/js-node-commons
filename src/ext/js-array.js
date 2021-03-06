//
'use strict';

/////////// Array ///////////

Array.prototype.jsMove = function(old_index, new_index) {
  if (new_index >= this.length) {
    var k = new_index - this.length;
    while (k-- + 1) {
      this.push(undefined);
    }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  return this; // for testing purposes
};

Array.prototype.jsClean = function() {
  this.length = 0;
};

Array.prototype.jsIsEmpty = function() {
  return this.length === 0;
};

//
