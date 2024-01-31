module.exports = {
  friendlyName: "Update live packed orders",

  fn: async function () {
    console.time("Update live packed orders");

    // const { resolve } = require("node:dns/promises");
    // const connected = await resolve("www.google.com");
    // console.log(connected);

    const rawResult = await OrderSummaryLocal.getDatastore().sendNativeQuery(
      "SELECT id,phone,status,order_id FROM order_summary WHERE cnno=pre_cnno;",
    );

    for await (const sticker of rawResult.rows) {
      await Order.updateOne({ id: sticker.order_id }).set({ status: sticker.status, pre_cnno: null, pre_cnno_price: null });
      await OrderSummaryLocal.updateOne({ id: sticker.id }).set({ pre_cnno: null, pre_cnno_price: null });
    }

    console.timeEnd("Update live packed orders");
  },
};
