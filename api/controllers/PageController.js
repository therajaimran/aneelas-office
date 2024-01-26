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

    const _order_summary = await OrderSummaryLocal.find({
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

    let total = 0;
    let order = null;
    let products = null;
    if (_order_summary.length) {
      total = +_order_summary[0].codAmount;
      products = _order_summary[0].orderObject;
      order = { id: _order_summary[0].id, orderId: _order_summary[0].orderId };
    } else {
      return res.status(400).json({
        order: {
          message: "Order not found!",
          rule: "not found",
        },
      });
    }

    return res.json({ products, total, order });
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
      id: inputs.summary.id,
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

      let total = 0;
      let totalItems = 0;
      let isPaid = false;
      let description = "";
      const productIds = [];
      const products = JSON.parse(_order.order_object);
      products.forEach((item) => {
        total += +item.itemPrice;

        if (item.id < 1000000) {
          totalItems++;
          description += item.name.replace(/\s/g, "_");
          productIds.push(+item.id);
        } else if (item.id > 1000000 && item.name.indexOf("(-)Stripe Confirmation Id") !== -1 && item.itemPrice < 0) {
          isPaid = true;
        }
      });

      if (!isPaid) {
        if (_order.city.toLowerCase() === "lahore") {
          total += 200;
        } else {
          total += 250;
        }
      }

      const riderCities = await Order.cityMapping();

      let isRider = false;
      if (_order.city) {
        riderCities.forEach((mapping) => {
          if (_order.city.toLowerCase() === mapping.rider.toLowerCase()) {
            isRider = true;
          }
        });
      }

      let consigneeNo = null;
      if (isRider) {
        const cities = await sails.helpers.adminRiderLogisticsCities();

        let cityId = null;
        cities.forEach((item) => {
          if (_order.city.toLowerCase() === item.description.toLowerCase()) {
            cityId = item.title;
          }
        });

        const cnumRes = await sails.helpers.createRiderLogisticsConsigneeNo.with({
          total,
          cityId,
          totalItems,
          weight: "",
          description: "",
          orderId: _order.id,
          phone: _order.phone,
          address: _order.address,
          username: _order.username,
        });

        consigneeNo = cnumRes.CNUM;
      } else {
        const cities = await sails.helpers.adminCallCourierCities();

        let cityId = null;
        Object.keys(cities).forEach((key) => {
          if (_order.city.toUpperCase() === cities[key]) {
            cityId = +key;
          }
        });

        const cnnoRes = await sails.helpers.createCallCourierConsigneeNo.with({
          total,
          cityId,
          description,
          city: _order.city,
          phone: _order.phone,
          address: _order.address,
          username: _order.username,
        });

        consigneeNo = cnnoRes.CNNO;
      }

      if (!consigneeNo) {
        return res.status(400).json({ message: "Consignee no is not available." });
      }

      const { moment } = sails.config.globals;
      const { Buffer } = require("node:buffer");

      const datetime = moment().format("YYYY-MM-DD HH:mm:ss");

      const _update = {
        orderTempId: _order.temp_id,
        username: _order.username,
        address: _order.address,
        phone: _order.phone,
        city: _order.city,

        courierName: isRider ? "rider_logistics" : "call_courier",
        cnno: consigneeNo,
        itemsCount: productIds.length.toString(),
        itemsInOrder: productIds.join(","),
        codAmount: total.toString(),
        orderObject: products,
        orderId: _order.id.toString(),
        printedBy: "dispatch_office",

        orderAt: datetime,
        printedAt: datetime,
        createdAt: datetime,
      };

      const _summary = await OrderSummaryLocal.find({
        where: { itemsCount: productIds.length.toString(), orderId: _order.id.toString(), itemsInOrder: productIds.join(",") },
        sort: "id DESC",
        limit: 1,
      });
      if (_summary.length) {
        await OrderSummaryLocal.updateOne({ id: _summary[0].id }).set({ ..._summary[0], ..._update });
      } else {
        const fetchSummary = await OrderSummaryLocal.create({ ..._update }).fetch();
        const tempId = Buffer.from(fetchSummary.id.toString()).toString("base64");
        await OrderSummaryLocal.updateOne({ id: fetchSummary.id }).set({ tempId });
      }

      await Order.updateOne({ id: inputs.id }).set({ pre_cnno: consigneeNo, pre_cnno_price: total.toString() });

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
