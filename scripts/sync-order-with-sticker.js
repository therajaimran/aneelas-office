module.exports = {
  friendlyName: "Sync order with sticker",

  fn: async function () {
    await OrderSummaryLocal.stream({
      where: {
        orderTempId: null,
      },
      sort: "id ASC",
      limit: 1000,
    }).eachRecord(async (summary, proceed) => {
      console.log("Processing summary:", summary.id, summary.orderId);

      const _order = await OrderLocal.findOne({ id: summary.orderId });

      if (_order) {
        const orderObject = JSON.parse(_order.order_object);

        const productIds = [];
        const orderTempId = _order.temp_id;
        orderObject.forEach((item) => {
          if (item.id < 1000000) {
            productIds.push(item.id);
          }
        });

        const _update = {
          orderTempId,
          orderObject,
          itemsInOrder: productIds.join(","),
          productFullId: productIds.join(","),
          itemsCount: productIds.length.toString(),
        };

        if (!summary.courierName && summary.cnno) {
          if (summary.cnno.startsWith("102") || summary.cnno.startsWith("111")) {
            _update.courierName = "call_courier";
          } else if (summary.cnno.startsWith("WR")) {
            _update.courierName = "rider_logistics";
          }
        }

        await OrderSummaryLocal.updateOne({ id: summary.id }).set({ ..._update });

        // await Utility.delay(299);
      }

      return proceed();
    });
  },
};
