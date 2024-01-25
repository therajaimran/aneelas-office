/**
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on any of these options, check out:
 * https://sailsjs.com/config/globals
 */

module.exports.globals = {
  /****************************************************************************
   *                                                                           *
   * Whether to expose the locally-installed Lodash as a global variable       *
   * (`_`), making  it accessible throughout your app.                         *
   *                                                                           *
   ****************************************************************************/

  _: require("lodash"),

  moment: require("moment"),

  /****************************************************************************
   *                                                                           *
   * This app was generated without a dependency on the "async" NPM package.   *
   *                                                                           *
   * > Don't worry!  This is totally unrelated to JavaScript's "async/await".  *
   * > Your code can (and probably should) use `await` as much as possible.    *
   *                                                                           *
   ****************************************************************************/

  async: false,

  /****************************************************************************
   *                                                                           *
   * Whether to expose each of your app's models as global variables.          *
   * (See the link at the top of this file for more information.)              *
   *                                                                           *
   ****************************************************************************/

  models: true,

  /****************************************************************************
   *                                                                           *
   * Whether to expose the Sails app instance as a global variable (`sails`),  *
   * making it accessible throughout your app.                                 *
   *                                                                           *
   ****************************************************************************/

  sails: true,
};

/**
 * Global Prototypes
 */
Array.prototype.sortByKey = function (key = "id", asc = true) {
  this.sort(function (a, b) {
    if (+a[key] === +b[key]) {
      return 0;
    } else {
      if (asc) {
        return +a[key] < +b[key] ? -1 : 1;
      } else {
        return +a[key] > +b[key] ? -1 : 1;
      }
    }
  });
};

Array.prototype.unique = function () {
  return this.filter((item, i, ar) => ar.indexOf(item) === i);
};

String.prototype.isJson = function () {
  try {
    JSON.parse(this);
  } catch (e) {
    return false;
  }
  return true;
};

String.prototype.trimSymbol = function (char = " ") {
  return this.trim().split(char).filter(Boolean).join(char);
};

String.prototype.snakeCase = function () {
  return this.toUpperCase().replace(/\s+/g, "_").replace(/\W/g, "");
};

String.prototype.camelCase = function () {
  return this.replace(/^\w|[A-Z]|\b\w/g, function (word, index) {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  })
    .replace(/\s+/g, "")
    .replace(/\W/g, "");
};

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
