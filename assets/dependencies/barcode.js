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

String.prototype.toCapitalizeCase = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.toCapitalizeAllWords = function () {
  let splitStr = this.toLowerCase().split(" ");
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].toCapitalizeCase();
  }
  return splitStr.join(" ");
};
