Number.prototype.zeroPadding = function () {
  var ret = "" + this.valueOf();
  return ret.length == 1 ? "0" + ret : ret;
};

var currentdate = new Date();
var datetime =
  currentdate.getDate() +
  "/" +
  (currentdate.getMonth() + 1) +
  "/" +
  currentdate.getFullYear() +
  " @ " +
  currentdate.getHours() +
  ":" +
  currentdate.getMinutes() +
  ":" +
  currentdate.getSeconds();
