/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  "GET  /get-device-id": { controller: "PageController", action: "getDeviceId" },

  "GET  /": { controller: "PageController", action: "homepage" },
  "GET  /barcode": { controller: "BarcodeController", action: "barcode" },
  "POST /orders/find-products": { controller: "PageController", action: "findProducts" },

  "GET  /orders/print-sticker/:id": { controller: "PageController", action: "printSticker" },

  "POST /orders/skip-sticker": { controller: "PageController", action: "skipSticker" },
  "POST /orders/confirm-sticker": { controller: "PageController", action: "confirmSticker" },

  "POST /upload-thumb": { controller: "PageController", action: "uploadThumbs" },
  "POST /order-summary-local": { controller: "PageController", action: "localSummary" },

  "POST /order-local": { controller: "PageController", action: "localOrder" },
};
