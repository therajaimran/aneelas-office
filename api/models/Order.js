/**
 * @class Order
 * @mixes {Waterline~Model}
 */

module.exports = {
  tableName: "new_orders",

  attributes: {
    phone: {
      required: true,
      type: "string",
      columnName: "phone",
    },

    secondaryPhone: {
      required: true,
      type: "string",
      columnName: "user_phone_secondary",
    },

    amount: {
      required: true,
      type: "string",
      columnName: "total_amount",
    },

    city: {
      required: true,
      type: "string",
      columnName: "city",
    },

    products: {
      type: "json",
      columnName: "order_object",
    },

    bookingType: {
      allowNull: true,
      type: "string",
      columnName: "booking_type",
    },

    trackingFlag: {
      required: true,
      type: "string",
      columnName: "tracking_flag",
    },

    cnno: {
      type: "string",
      columnName: "call_courier_cnno",
      allowNull: true,
    },

    status: {
      required: true,
      type: "string",
      columnName: "status",
    },

    fileCode: {
      type: "string",
      allowNull: true,
      columnName: "file_code",
    },

    cnnoStatus: {
      required: true,
      type: "string",
      columnName: "call_courier_last_status",
    },

    cnnoReceiver: {
      required: true,
      type: "string",
      columnName: "call_courier_receiver_name",
    },

    cnnoWeight: {
      type: "string",
      columnName: "call_courier_item_weight",
      allowNull: true,
    },

    dateInsert: {
      type: "ref",
      columnType: "datetime",
      columnName: "date_insert",
    },
  },

  searchSummary: async (tempId) => {
    const _summary = await OrderSummary.findOne({
      select: ["id", "orderId", "cnno", "codAmount", "dispatchRider", "dispatchDelivery", "returnedAt"],
      where: { tempId },
    });

    let _return = null;
    if (_summary && _summary.orderId) {
      const rawResult = await Order.getDatastore().sendNativeQuery("SELECT * FROM new_orders WHERE id=$1;", [_summary.orderId]);
      if (rawResult.rows.length) {
        _return = { order: { ...rawResult.rows[0] }, summary: _summary };
      }
    }

    return _return;
  },

  search: async (search, one = false) => {
    const rawSQL = `SELECT * FROM new_orders WHERE (id=$1 OR LOWER(temp_id)=$1 OR call_courier_cnno=$1 OR trax_tracking_number=$1 OR rider_logistics_cnum=$1) ORDER BY id DESC ${
      one ? "LIMIT 1" : ""
    };`;
    const rawResult = await Order.getDatastore().sendNativeQuery(rawSQL, [search.toLowerCase()]);

    let _return = null;
    if (rawResult.rows.length) {
      if (one) {
        _return = { ...rawResult.rows[0] };
      } else {
        _return = [...rawResult.rows];
      }
    }

    return _return;
  },

  searchIn: async (filed, value, select = "*") => {
    const rawSQL = `SELECT ${select} FROM new_orders WHERE ${filed} IN (${value.join(",")}) ORDER BY id DESC;`;
    const rawResult = await Order.getDatastore().sendNativeQuery(rawSQL);

    let _return = null;
    if (rawResult.rows.length) {
      _return = [...rawResult.rows];
    }

    return _return;
  },
};
