/**
 * @class CustomerStatusLocal
 * @mixes {Waterline~Model}
 */

module.exports = {
  tableName: "apk_customer_status",

  attributes: {
    device_id: { type: "string", allowNull: true },
    customer_id: { type: "number", allowNull: true },
    phone: { type: "string" },
    last_order_id: { type: "number" },
    order_ids: { type: "string" },
    status_count: { type: "ref" },
    status_total: { type: "ref" },
    updated_at: { type: "ref", autoUpdatedAt: true },
    created_at: { type: "ref", autoCreatedAt: true },
  },
};
