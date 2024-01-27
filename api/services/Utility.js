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

exports.initLiveLocalOrders = function () {
  Order.find({
    select: ["id"],
    where: {
      phone: "03006761160",
      pre_cnno: null,
      status: ["confirmed", "on_hold"],
    },
    limit: 1,
  }).exec(function (err, order) {
    if (order.length) {
      const datetime = sails.config.globals.moment().format("YYYY-MM-DD HH:mm:ss");
      console.log(`${datetime}:: Order found for local: ${order[0].id}`);
      Utility.liveLocalOrders(order[0].id).then(() => {
        Utility.initLiveLocalOrders();
      });
    } else {
      setTimeout(
        () => {
          const datetime = sails.config.globals.moment().format("YYYY-MM-DD HH:mm:ss");
          console.log(`${datetime}:: Initiated Live to Local Orders`);
          Utility.initLiveLocalOrders();
        },
        10 * 60 * 1000,
      );
    }
  });
};

exports.liveLocalOrders = async function (order) {
  const _order = await Order.search(order.toString(), true);

  if (!_order) {
    return false;
  }

  if (_order && _order.order_object && _order.order_object.startsWith('[{"id":')) {
    _order.order_object = JSON.parse(_order.order_object);
  } else {
    _order.order_object = [];
  }

  if (_order.pre_cnno || _order.pre_cnno === "000000") {
    return false;
  }

  await sails.helpers.refreshStatuses.with({ order_id: _order.id });

  const histories = await Order.history(_order.user_phone_secondary);

  let returnedTotal = 0;
  let deliveredTotal = 0;
  let unDeliveredTotal = 0;
  const status_count = { confirmed: 0, delivered: 0, returned: 0, dispatched: 0 };
  const status_total = { confirmed: 0, delivered: 0, returned: 0, dispatched: 0, unDelivered: 0 };
  for await (const history of histories) {
    let total = 0;
    for await (const product of history.order_object) {
      if (product.id < 1000000) {
        total += product.itemPrice * product.qty;
      }
    }

    if (
      history.status?.toLowerCase() === "delivered" ||
      history.stripe_status?.toLowerCase() === "paid" ||
      history.status?.toLowerCase() === "dispatch_trax" ||
      history.trax_last_status?.toLowerCase() === "delivered" ||
      history.rider_last_status?.toLowerCase() === "delivered" ||
      history.call_courier_last_status?.toLowerCase() === "delivered"
    ) {
      deliveredTotal += total;
      status_count.delivered++;
      status_total.delivered += total;
    } else if (
      history.status.toLowerCase() === "returned" ||
      history.call_courier_last_status?.toLowerCase() === "undelivered" ||
      history.call_courier_last_status?.toLowerCase() === "contacting consignee" ||
      history.call_courier_last_status?.toLowerCase() === "out for return submission"
    ) {
      returnedTotal += total;
      status_count.returned++;
      status_total.returned += total;
    } else if (history.status.toLowerCase() === "confirmed" || history.status.toLowerCase() === "on_demand") {
      status_count.confirmed++;
      status_total.confirmed += total;
    } else if (history.status.toLowerCase().indexOf("dispatch") !== -1) {
      status_count.dispatched++;
      status_total.dispatched += total;
    } else {
      unDeliveredTotal += total;
      status_total.unDelivered += total;
    }
  }

  if (
    (_order.phone.startsWith("03") && _order.phone.length === 11) ||
    (_order.phone.startsWith("923") && _order.phone.length === 12) ||
    _order.phone.startsWith("+923") ||
    _order.phone.startsWith("00923")
  ) {
    await Utility.customerConfirm(
      _order,
      histories.map((item) => item.id),
      status_count,
      status_total,
    );

    if (histories.length === 1 || deliveredTotal > returnedTotal) {
      await Utility.checkOrderSplit(_order);
    } else if (!deliveredTotal && returnedTotal > 10000) {
      // block user from every number and device ID
    }
  } else {
    return false;
  }
};

exports.makeTempId = function () {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  let result2 = "";
  const characters2 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength2 = characters2.length;
  for (let j = 0; j < 4; j++) {
    result2 += characters2.charAt(Math.floor(Math.random() * charactersLength2));
  }

  return result + result2;
};

exports.checkOrderSplit = async function (order) {
  if (order.city) {
    let total = 0;
    let demandTotal = 0;
    const products = [];
    const demandProducts = [];
    order.order_object.forEach((item) => {
      if (item.name.toLowerCase().indexOf("aneelas") !== -1 || item.name.toLowerCase().indexOf("pre booking") !== -1) {
        demandProducts.push({ ...item });
        demandTotal += +item.qty * +item.itemPrice;
      } else {
        products.push({ ...item });
        total += +item.qty * +item.itemPrice;
      }
    });

    let dc = 200;
    if (order.city.toLowerCase() !== "lahore") {
      dc = 250;
    }

    const datetime = sails.config.globals.moment().format("YYYY-MM-DD HH:mm:ss");

    if (order.order_object.length > 0 && order.order_object.length === demandProducts.length) {
      await Order.updateOne({ id: order.id }).set({
        call_courier_last_status: null,
        call_courier_response: null,
        call_courier_used_by: null,
        call_courier_address: null,
        trax_tracking_number: null,
        trax_status_object: null,
        call_courier_cnno: null,
        rider_last_status: null,
        trax_last_status: null,
        pre_cnno_price: null,
        trax_response: null,
        booking_type: null,
        pre_cnno: null,

        status: "on_demand",
        admin_status: "pending_approval",
      });
    } else if (products.length > 0 && demandProducts.length > 0 && order.order_object.length !== demandProducts.length) {
      const updateCreate = { ...order };
      delete updateCreate.id;
      await Order.create({
        ...updateCreate,
        order_object: JSON.stringify(demandProducts),
        total_amount: demandTotal.toString(),
        user_phone_secondary: order.phone,
        accountcode: order.accountcode,
        device_id: order.device_id,
        parent_order_id: order.id,
        username: order.username,
        address: order.address,
        phone: order.phone,
        city: order.city,

        status: "on_demand",
        order_type: "split",
        date_insert: datetime,
        admin_status: "pending_approval",
        temp_id: await Utility.makeTempId(),

        call_courier_cnno: null,
        balanceUtilize: null,
        pre_cnno_price: null,
        pre_cnno: null,
      });

      const _order = await Order.updateOne({ id: order.id }).set({
        call_courier_last_status: null,
        call_courier_response: null,
        call_courier_used_by: null,
        call_courier_address: null,
        trax_tracking_number: null,
        trax_status_object: null,
        call_courier_cnno: null,
        rider_last_status: null,
        trax_last_status: null,
        pre_cnno_price: null,
        trax_response: null,
        booking_type: null,
        pre_cnno: null,

        order_object: JSON.stringify(products),
        total_amount: (total + dc).toString(),
        admin_status: "pending_approval",
      });

      if (_order && _order.order_object && _order.order_object.startsWith('[{"id":')) {
        _order.order_object = JSON.parse(_order.order_object);
      } else {
        _order.order_object = [];
      }

      await Utility.generateCNNO(_order);
    } else if (demandProducts.length === 0 && order.order_object.length > 0) {
      await Utility.generateCNNO(order);
    }
  }
};

exports.generateCNNO = async function (_order) {
  let total = 0;
  let totalItems = 0;
  let isPaid = false;
  let description = "";
  const productIds = [];

  if (_order.order_object.length) {
    _order.order_object.forEach((item) => {
      total += +item.qty * +item.itemPrice;

      if (item.id < 1000000) {
        totalItems++;
        description += item.name.replace(/\s/g, "_");
        productIds.push(+item.id);
      } else if (item.id > 1000000 && item.name.indexOf("(-)Stripe Confirmation Id") !== -1 && +item.itemPrice < 0) {
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

    if (consigneeNo) {
      const { moment } = sails.config.globals;
      const { Buffer } = require("node:buffer");

      const datetime = moment().format("YYYY-MM-DD HH:mm:ss");

      const _update = {
        orderObject: _order.order_object,
        codAmount: _order.total_amount,
        orderId: _order.id.toString(),
        orderAt: _order.date_insert,
        orderTempId: _order.temp_id,
        username: _order.username,
        address: _order.address,
        phone: _order.phone,
        city: _order.city,

        courierName: isRider ? "rider_logistics" : "call_courier",
        itemsCount: productIds.length.toString(),
        itemsInOrder: productIds.join(","),
        pre_cnno_price: total.toString(),
        pre_cnno: consigneeNo,
        status: "confirmed",
        createdAt: datetime,
      };

      const fetchSummary = await OrderSummaryLocal.create({ ..._update }).fetch();
      const tempId = Buffer.from(fetchSummary.id.toString()).toString("base64");
      await OrderSummaryLocal.updateOne({ id: fetchSummary.id }).set({ tempId });

      await Order.updateOne({ id: _order.id }).set({ status: "processing", pre_cnno: consigneeNo, pre_cnno_price: total.toString() });
    }
  }
};

exports.customerConfirm = async function (order, ids, status_count, status_total) {
  const _customer = await CustomerStatusLocal.findOne({ device_id: order.device_id });

  const _update = {
    phone: order.phone,
    last_order_id: order.id,
    order_ids: ids.join(","),
    status_count,
    status_total,
  };

  if (_customer) {
    await CustomerStatusLocal.updateOne({ id: _customer.id }).set({ ..._update });
  } else {
    _update.device_id = order.device_id;
    await CustomerStatusLocal.create({ ..._update });
  }
};
