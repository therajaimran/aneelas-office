/**
 * @class Packing
 */

exports.findOrder = async function (deviceId, unique = 5) {
  const { _ } = sails.config.globals;

  let _order_summaries = await OrderSummaryLocal.find({
    select: ["id", "orderId"],
    where: {
      status: "confirmed",
      pre_cnno: { "!=": null },
      pre_cnno_price: { "!=": null },
    },
    sort: "id DESC",
  });

  _order_summaries = _.uniqBy(_order_summaries, "orderId");

  const uniqueOrders = [];
  for await (const orderSummary of _order_summaries) {
    const printed = await OrderSummaryLocal.count({
      status: ["dispatch_rider_logistics", "dispatch_reverse_pickup", "dispatch_call_courier", "dispatch_temp_id", "dispatch_trax"],
      orderId: orderSummary.orderId,
      pre_cnno: null,
    });

    if (!printed) {
      uniqueOrders.push({ ...orderSummary });
    }

    if (uniqueOrders.length >= unique) {
      break;
    }
  }

  if (!uniqueOrders.length) {
    return null;
  }

  const { resolve } = require("node:path");
  const { readFile, writeFile } = require("node:fs/promises");

  const packingFile = resolve("./storage/start-packing.json");
  let fileContent = await readFile(packingFile, { encoding: "utf8" });

  let _summary = null;
  if (fileContent.isJson()) {
    fileContent = JSON.parse(fileContent);

    const assignOrders = Object.values(fileContent);
    for await (const _order_summary of _order_summaries) {
      if (!assignOrders.includes(_order_summary.id)) {
        _summary = { ..._order_summary };
        break;
      }
    }

    if (_summary) {
      fileContent[deviceId] = _summary.id;
      await writeFile(packingFile, JSON.stringify(fileContent), { encoding: "utf8" });
    }
  }

  return _summary;
};
