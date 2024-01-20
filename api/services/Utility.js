/**
 * @class Utility
 */

exports.convertToMB = function (bytes) {
  return Math.round((bytes / 1e6) * 100) / 100 + "mb";
};

exports.execShell = function (cmd) {
  const { exec } = require("child_process");
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

exports.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
