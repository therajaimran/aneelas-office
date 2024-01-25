/**
 * @class BarcodeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  barcode: (req, res) => {
    const inputs = req.allParams();

    const productId = inputs.itemId;
    const total = +inputs.total;
    const name = inputs.name;

    return res.view("pages/barcode", { productId, total, name, title: "Generate Barcode", layout: false });
  },
};
