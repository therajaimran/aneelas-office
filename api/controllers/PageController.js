/**
 * @class PageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  homepage: async (req, res) => res.view("pages/homepage", { title: "Validate Order Products" }),

  findProducts: async (req, res) => {
    const inputs = req.allParams();

    const VS = Validator(inputs, {
      search: "required|string",
    });

    const matched = await VS.check();

    if (!matched) {
      return res.status(400).json(VS.errors);
    }

    const _order_summary = await OrderSummaryLocal.findOne({ tempId: inputs.search });

    if (!_order_summary) {
      return res.status(400).json({
        order: {
          message: "Order not found!",
          rule: "not found",
        },
      });
    }

    const total = +_order_summary.codAmount;
    const products = _order_summary.orderObject;

    return res.json({ products, total });
  },

  localSummary: async (req, res) => {
    const inputs = req.allParams();

    const VS = Validator(inputs, {
      summary: "required|string",
    });

    const matched = await VS.check();

    if (!matched) {
      return res.status(400).json(VS.errors);
    }

    const summary = JSON.parse(inputs.summary);

    await OrderSummaryLocal.create({
      id: summary.id,
      tempId: summary.temp_id,
      warehouseAt: summary.warehouse_at,
      dispatchRider: summary.dispatch_rider,
      dispatchAt: summary.dispatch_at,
      dispatchDelivery: summary.dispatch_delivery,
      deliveredAt: summary.delivered_at,
      arrivedAt: summary.arrived_at,
      returnedAt: summary.returned_at,
      defecatedAt: summary.defecated_at,
      deliveryCharges: summary.delivery_charges,
      deliveryChargesAt: summary.delivery_charges_at,
      deliveryChargesInvoiceNo: summary.delivery_charges_invoice_no,
      paymentReceived: summary.payment_received,
      paymentReceivedAt: summary.payment_received_at,
      paymentReceivedInvoiceNo: summary.payment_received_invoice_no,
      statusInvoice: summary.status_invoice,
      statusInvoiceAt: summary.status_invoice_at,
      trackingStatusInvoice: summary.tracking_status_invoice,
      trackingStatusInvoiceAt: summary.tracking_status_invoice_at,
      trackingStatusTransactionAt: summary.tracking_status_transaction_at,
      trackingStatusCheckAt: summary.tracking_status_check_at,
      username: summary.user_name,
      address: summary.address,
      city: summary.city,
      phone: summary.phone,
      courierName: summary.courier_name,
      cnno: summary.cnno,
      itemsCount: summary.items_count,
      itemsInOrder: summary.items_in_order,
      codAmount: summary.cod_amount,
      orderObject: summary.order_object,
      orderId: summary.order_id,
      orderAt: summary.order_place_date,
      printedAt: summary.packed_datetime,
      packedAt: summary.packed_at,
      printedBy: summary.printed_by,
      createdAt: summary.created_at,
    });

    return res.json({ message: "Summary saved successfully." });
  },

  uploadThumbs: async (req, res) => {
    const thumb = req.file("thumb");

    let validated = true;
    let errorMessages = {};

    if (!thumb._files.length) {
      validated = false;
      errorMessages.video = {
        message: "The thumb file is mandatory.",
        rule: "required",
      };
    }

    if (!validated) {
      thumb.upload({ noop: true });
      return res.status(400).json(errorMessages);
    }

    const { resolve } = require("node:path");
    const filename = thumb._files[0].stream.filename;

    thumb.upload({ dirname: resolve("../html/thumbs"), maxBytes: 5.12e8, saveAs: filename }, async (err, files) => {
      if (err) {
        return res.status(400).json(err);
      }

      return res.json({ message: "Thumb uploaded successfully.", files });
    });
  },
};
