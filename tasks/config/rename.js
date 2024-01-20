const { short } = require("git-rev-sync");

module.exports = function(grunt) {
  const files = {};
  const hash = short();

  files[`.tmp/public/min/production.${hash}.min.js`] = ".tmp/public/min/production.min.js";
  files[`.tmp/public/min/production.${hash}.min.css`] = ".tmp/public/min/production.min.css";

  grunt.config.set("rename", {
    dist: {
      files: files
    }
  });

  grunt.loadNpmTasks("grunt-rename");
};
