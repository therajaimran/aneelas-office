/**
 * @class PageController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  homepage: async (req, res) => res.view("pages/homepage", { title: "Validate Order Products" }),

  getDeviceId: async (req, res) => {
    const crypto = require("node:crypto");

    const device_id = crypto.randomBytes(32).toString("hex");

    return res.json({ device_id });
  },

  startPacking: async (req, res) => {
    const inputs = req.allParams();

    const VS = Validator(inputs, {
      deviceId: "required|string|length:64,64",
    });

    const matched = await VS.check();

    if (!matched) {
      return res.status(400).json(VS.errors);
    }

    const findOrder = await Packing.findOrder(inputs.deviceId);

    if (!findOrder) {
      return res.json(null);
    }

    const _summary = await OrderSummaryLocal.findOne({ select: ["id", "orderId", "codAmount", "orderObject"], where: { id: findOrder.id } });

    const total = +_summary.codAmount;
    const products = _summary.orderObject;
    const order = { id: _summary.id, orderId: _summary.orderId };

    return res.json({ products, total, order, printed: 0 });
  },

  findProducts: async (req, res) => {
    const inputs = req.allParams();

    const VS = Validator(inputs, {
      search: "required|string",
    });

    const matched = await VS.check();

    if (!matched) {
      return res.status(400).json(VS.errors);
    }

    let _order_summary = await OrderSummaryLocal.find({
      where: {
        or: [
          { orderTempId: inputs.search },
          { orderId: inputs.search },
          { tempId: inputs.search },
          { phone: inputs.search },
          { cnno: inputs.search },
        ],
      },
      sort: "id DESC",
      limit: 1,
    });

    if (!_order_summary.length) {
      _order_summary = await OrderSummaryLocal.find({
        where: {
          status: "confirmed",
          pre_cnno: { "!=": null },
          pre_cnno_price: { "!=": null },
          itemsInOrder: { contains: inputs.search.split("_")[0] },
        },
        sort: "id DESC",
        limit: 1,
      });
    }

    if (!_order_summary.length) {
      return res.status(400).json({
        order: {
          message: "Order not found!",
          rule: "not found",
        },
      });
    }

    _order_summary = { ..._order_summary[0] };

    const total = +_order_summary.codAmount;
    const products = _order_summary.orderObject;
    const order = { id: _order_summary.id, orderId: _order_summary.orderId };

    const printed = await OrderSummaryLocal.count({
      status: ["dispatch_rider_logistics", "dispatch_reverse_pickup", "dispatch_call_courier", "dispatch_temp_id", "dispatch_trax"],
      orderId: _order_summary.orderId,
      pre_cnno: null,
    });

    return res.json({ products, total, order, printed });
  },

  skipSticker: async (req, res) => {
    const inputs = req.allParams();

    const VS = Validator(inputs, {
      sticker: "required|integer",
      deviceId: "required|string|length:64,64",
    });

    const matched = await VS.check();

    if (!matched) {
      return res.status(400).json(VS.errors);
    }

    const sticker = await OrderSummaryLocal.updateOne({ id: inputs.sticker }).set({ pre_cnno: "000000", pre_cnno_price: null, status: null });

    await Order.updateOne({ id: sticker.orderId }).set({ status: "confirmed", pre_cnno: "000000", pre_cnno_price: null });

    return res.json(sticker);
  },

  confirmSticker: async (req, res) => {
    const inputs = req.allParams();

    const VS = Validator(inputs, {
      sticker: "required|integer",
      deviceId: "required|string|length:64,64",
      duplicate: "required|boolean",

      products: "requiredIf:duplicate,false|array",
      "products.*": "requiredIf:duplicate,false|string",
    });

    const matched = await VS.check();

    if (!matched) {
      return res.status(400).json(VS.errors);
    }

    const sticker = await OrderSummaryLocal.findOne({ id: inputs.sticker });

    if (!sticker) {
      return res.status(400).json({
        order: {
          message: "Order for processing not found!",
          rule: "not found",
        },
      });
    }

    let cnno = null;
    let status = null;
    let products = [];
    let itemsInOrder = [];
    if (inputs.duplicate == "true") {
      const printed = await OrderSummaryLocal.find({
        status: ["dispatch_rider_logistics", "dispatch_reverse_pickup", "dispatch_call_courier", "dispatch_temp_id", "dispatch_trax"],
        productFullId: { "!=": null },
        orderId: sticker.orderId,
        pre_cnno: null,
      });

      let device = printed.find((item) => item.printedBy === inputs.deviceId);

      if (!device) {
        device = printed.find((item) => item.printedBy.length === 64);

        if (!device) {
          device = printed[0];
        }
      }

      cnno = device.cnno;
      status = device.status;
      products = device.productFullId.split(",");
      itemsInOrder = device.itemsInOrder.split(",");
    } else {
      cnno = sticker.pre_cnno;
      products = inputs.products;
      status = `dispatch_${sticker.courierName}`;
      itemsInOrder = inputs.products.map((item) => item.split("_")[0]);
    }

    const { moment } = sails.config.globals;
    const { Buffer } = require("node:buffer");

    const datetime = moment().format("YYYY-MM-DD HH:mm:ss");

    const _update = {
      ...sticker,

      cnno,
      status,
      printedBy: inputs.deviceId,
      productFullId: products.join(","),
      itemsInOrder: itemsInOrder.join(","),
      itemsCount: products.length.toString(),

      packedAt: datetime,
      printedAt: datetime,
      createdAt: datetime,

      tempId: null,
      pre_cnno: null,
      arrivedAt: null,
      dispatchAt: null,
      returnedAt: null,
      deliveredAt: null,
      defecatedAt: null,
      warehouseAt: null,
      statusInvoice: null,
      dispatchRider: null,
      deliveryCharges: null,
      paymentReceived: null,
      statusInvoiceAt: null,
      dispatchDelivery: null,
      deliveryChargesAt: null,
      paymentReceivedAt: null,
      trackingStatusCheckAt: null,
      trackingStatusInvoice: null,
      trackingStatusInvoiceAt: null,
      deliveryChargesInvoiceNo: null,
      paymentReceivedInvoiceNo: null,
      trackingStatusTransactionAt: null,
    };

    delete _update.id;

    let fetchSummary = await OrderSummaryLocal.create({ ..._update }).fetch();
    const tempId = Buffer.from(fetchSummary.id.toString()).toString("base64");
    fetchSummary = await OrderSummaryLocal.updateOne({ id: fetchSummary.id }).set({ tempId });

    await OrderSummaryLocal.updateOne({ id: sticker.id }).set({ pre_cnno: null, pre_cnno_price: null, status });

    return res.json(fetchSummary);
  },

  printSticker: async (req, res) => {
    const inputs = req.allParams();
    const { moment } = sails.config.globals;

    const sticker = await OrderSummaryLocal.findOne({ id: inputs.id });

    let symbol = "";
    const statusArray = sticker.status.split("dispatch_");

    // if (sticker.status === "dispatch_call_courier" || sticker.status === "dispatch_rider_logistics") {
    //   symbol = "@";
    // } else
    if (sticker.status === "dispatch_call_courier" || sticker.status === "dispatch_rider_logistics" || sticker.status === "dispatch_trax") {
      symbol = "#";
    } else if (sticker.status === "dispatch_local_delivery") {
      symbol = "+";
    }

    const statusOrder = statusArray[1]?.toUpperCase();

    const lahore = sticker.city.toLowerCase() === "lahore" ? "********" : "";

    const date_insert = moment(sticker.orderAt).format("YYYY-MM-DD HH:mm");
    const sticker_time = moment(sticker.packedAt).format("YYYY-MM-DD HH:mm");

    const printed = await OrderSummaryLocal.count({
      status: ["dispatch_rider_logistics", "dispatch_reverse_pickup", "dispatch_call_courier", "dispatch_temp_id", "dispatch_trax"],
      orderId: sticker.orderId,
      id: { "!=": sticker.id },
      pre_cnno: null,
    });

    return res.view("pages/print-sticker", {
      title: "Print Sticker",
      duplicate: printed,
      sticker,
      statusOrder,
      lahore,
      symbol,
      date_insert,
      sticker_time,
      layout: false,
    });
  },

  localSummary: async (req, res) => {
    const inputs = req.allParams();

    const VS = Validator(inputs, {
      summary: "required|object",
    });

    const matched = await VS.check();

    if (!matched) {
      return res.status(400).json(VS.errors);
    }

    await OrderSummaryLocal.create({
      tempId: inputs.summary.temp_id,
      orderTempId: inputs.summary.order_temp_id,
      warehouseAt: inputs.summary.warehouse_at,
      dispatchRider: inputs.summary.dispatch_rider,
      dispatchAt: inputs.summary.dispatch_at,
      dispatchDelivery: inputs.summary.dispatch_delivery,
      deliveredAt: inputs.summary.delivered_at,
      arrivedAt: inputs.summary.arrived_at,
      returnedAt: inputs.summary.returned_at,
      defecatedAt: inputs.summary.defecated_at,
      deliveryCharges: inputs.summary.delivery_charges,
      deliveryChargesAt: inputs.summary.delivery_charges_at,
      deliveryChargesInvoiceNo: inputs.summary.delivery_charges_invoice_no,
      paymentReceived: inputs.summary.payment_received,
      paymentReceivedAt: inputs.summary.payment_received_at,
      paymentReceivedInvoiceNo: inputs.summary.payment_received_invoice_no,
      statusInvoice: inputs.summary.status_invoice,
      statusInvoiceAt: inputs.summary.status_invoice_at,
      trackingStatusInvoice: inputs.summary.tracking_status_invoice,
      trackingStatusInvoiceAt: inputs.summary.tracking_status_invoice_at,
      trackingStatusTransactionAt: inputs.summary.tracking_status_transaction_at,
      trackingStatusCheckAt: inputs.summary.tracking_status_check_at,
      username: inputs.summary.user_name,
      address: inputs.summary.address,
      city: inputs.summary.city,
      phone: inputs.summary.phone,
      courierName: inputs.summary.courier_name,
      cnno: inputs.summary.cnno,
      itemsCount: inputs.summary.items_count,
      itemsInOrder: inputs.summary.items_in_order,
      productFullId: inputs.summary.product_full_id,
      codAmount: inputs.summary.cod_amount,
      orderObject: inputs.summary.order_object,
      orderId: inputs.summary.order_id,
      orderAt: inputs.summary.order_place_date,
      printedAt: inputs.summary.packed_datetime,
      packedAt: inputs.summary.packed_at,
      printedBy: inputs.summary.printed_by,
      createdAt: inputs.summary.created_at,

      status: `dispatch_${inputs.summary.courier_name || "temp_id"}`,
    });

    return res.json({ message: "Summary saved successfully." });
  },

  localOrder: async (req, res) => {
    const inputs = req.allParams();

    const VS = Validator(inputs, {
      id: "required|integer",
    });

    const matched = await VS.check();

    if (!matched) {
      return res.status(400).json(VS.errors);
    }

    try {
      const _order = await Order.findOne({ id: inputs.id });

      if (!_order) {
        return res.status(400).json({ message: "Order is not available." });
      }

      if (!_order.city) {
        return res.status(400).json({ message: "Order city is not available." });
      }

      if (_order && _order.order_object && _order.order_object.startsWith('[{"id":')) {
        _order.order_object = JSON.parse(_order.order_object);
      } else {
        _order.order_object = [];
      }

      await Utility.generateCNNO(_order);

      return res.json({ message: "Order saved successfully and pre-cnno generated." });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Execution error." });
    }
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
