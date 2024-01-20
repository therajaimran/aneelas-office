/**
 * @class PageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  homepage: async (req, res) => res.view("pages/homepage", { title: "Validate Order Products" }),
};
