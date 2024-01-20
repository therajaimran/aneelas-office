/**
 * @class Validator
 *
 * Validate inputs and generate messages accordingly
 *
 * Test:
 * /^\d{11}$/
 * /^\d{3}\d{7}$/
 * /^\d{4}-\d{7}$/
 * /^\d{3}\s\d{7}$/
 * /^((((\+|00|())92(-|\s){0,1})|0)|())3\d{2}(-|\s){0,1}\d{7}$/
 *
 * Replace:
 * /[^\d]/g
 * /^(92|0)+/g
 */

module.exports = (inputs, rules) => {
  const NIV = require("node-input-validator");

  NIV.extend("basic-string", ({ value }) => /^[\w\-\s]+$/g.test(value));
  NIV.extend("mobile-PK", ({ value }) => /^((((\+|00|())92(-|\s){0,1})|0)|())3\d{2}(-|\s){0,1}\d{7}$/g.test(value));

  NIV.extendMessages(
    {
      "basic-string": "The :attribute value is invalid.",
      "mobile-PK": "The :attribute value is invalid. eg: 300 1234567, 0300 1234567, +92 300 1234567",
    },
    "en",
  );

  return new NIV.Validator(inputs, rules);
};
