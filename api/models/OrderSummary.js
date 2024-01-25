/**
 * @class OrderSummary
 * @mixes {Waterline~Model}
 */

module.exports = {
  datastore: "liveDB",

  tableName: "order_summary",

  attributes: {
    tempId: {
      type: "string",
      allowNull: true,
      columnName: "temp_id",
    },

    username: {
      required: true,
      type: "string",
      columnName: "user_name",
    },

    address: {
      allowNull: true,
      type: "string",
    },

    city: {
      required: true,
      type: "string",
    },

    phone: {
      type: "string",
      allowNull: true,
    },

    courierName: {
      type: "string",
      allowNull: true,
      columnName: "courier_name",
    },

    cnno: {
      required: true,
      type: "string",
    },

    itemsCount: {
      required: true,
      type: "string",
      columnName: "items_count",
    },

    itemsInOrder: {
      type: "string",
      columnName: "items_in_order",
      allowNull: true,
    },

    codAmount: {
      type: "string",
      columnName: "cod_amount",
      allowNull: true,
    },

    orderObject: {
      type: "json",
      columnName: "order_object",
    },

    orderId: {
      type: "string",
      columnName: "order_id",
      allowNull: true,
    },

    warehouseAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "warehouse_at",
    },

    dispatchRider: {
      type: "number",
      allowNull: true,
      columnName: "dispatch_rider",
    },

    dispatchDelivery: {
      type: "string",
      allowNull: true,
      defaultsTo: "dispatched",
      columnName: "dispatch_delivery",
      isIn: ["returned", "delivered", "dispatched"],
    },

    dispatchAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "dispatch_at",
    },

    arrivedAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "arrived_at",
    },

    deliveredAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "delivered_at",
    },

    returnedAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "returned_at",
    },

    defecatedAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "defecated_at",
    },

    deliveryCharges: {
      type: "string",
      allowNull: true,
      columnName: "delivery_charges",
    },

    deliveryChargesAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "delivery_charges_at",
    },

    deliveryChargesInvoiceNo: {
      type: "string",
      allowNull: true,
      columnName: "delivery_charges_invoice_no",
    },

    paymentReceived: {
      type: "string",
      allowNull: true,
      columnName: "payment_received",
    },

    paymentReceivedAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "payment_received_at",
    },

    paymentReceivedInvoiceNo: {
      type: "string",
      allowNull: true,
      columnName: "payment_received_invoice_no",
    },

    statusInvoice: {
      type: "string",
      allowNull: true,
      columnName: "status_invoice",
    },

    statusInvoiceAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "status_invoice_at",
    },

    trackingStatusInvoice: {
      type: "string",
      allowNull: true,
      columnName: "tracking_status_invoice",
    },

    trackingStatusInvoiceAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "tracking_status_invoice_at",
    },

    trackingStatusTransactionAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "tracking_status_transaction_at",
    },

    trackingStatusCheckAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "tracking_status_check_at",
    },

    printedBy: {
      type: "string",
      allowNull: true,
      columnName: "printed_by",
    },

    orderAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "order_place_date",
    },

    packedAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "packed_datetime",
    },

    createdAt: {
      type: "ref",
      columnType: "datetime",
      columnName: "created_at",
    },
  },
};
