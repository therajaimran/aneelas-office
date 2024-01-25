/**
 * @class OrderLocal
 * @mixes {Waterline~Model}
 */

module.exports = {
  tableName: "new_orders",

  attributes: {
    username: { type: "string" },
    address: { type: "string" },
    city: { type: "string" },
    country: { type: "string" },
    phone: { type: "string" },
    user_phone_secondary: { type: "string" },
    device_id: { type: "string", allowNull: true },
    accountcode: { type: "string", allowNull: true },
    order_object: { type: "ref" },
    date_insert: { type: "ref" },
    price_type: { type: "string" },
    total_amount: { type: "string" },
    dollar_amount: { type: "string" },
    compiled_obj: { type: "string", allowNull: true },
    compiled_datetime_updated: { type: "ref" },
    compiled_by: { type: "string", allowNull: true },
    shipment_charges: { type: "string", allowNull: true },
    discount_amount: { type: "number", allowNull: true },
    coupon_voucher_id: { type: "string", allowNull: true },
    temp_id: { type: "string" },
    status: { type: "string" },
    approved_status: { type: "string", allowNull: true },
    pin_code: { type: "string", allowNull: true },
    advance_form_json: { type: "string", allowNull: true },
    pak_post_tracking: { type: "string", allowNull: true },
    call_courier_cnno: { type: "string", allowNull: true },
    mnp: { type: "string", allowNull: true },
    local_delivery: { type: "string", allowNull: true },
    call_courier_response: { type: "ref" },
    call_courier_used_by: { type: "string", allowNull: true },
    call_courier_address: { type: "string", allowNull: true },
    notes: { type: "string", allowNull: true },
    rejected_reason: { type: "string", allowNull: true },
    discount_apply: { type: "string", allowNull: true },
    orignal_parcel_price: { type: "string", allowNull: true },
    note_for_user: { type: "string", allowNull: true },
    adjust_type: { type: "string" },
    order_object_bk: { type: "string", allowNull: true },
    merged_order_id: { type: "number", allowNull: true },
    call_courier_last_status: { type: "string" },
    call_courier_receiver_name: { type: "string" },
    call_courier_tracking_script_time: { type: "ref" },
    product_parsing_script_time: { type: "ref" },
    script_running_time: { type: "ref" },
    tracking_flag: { type: "string" },
    call_courier_item_weight: { type: "string", allowNull: true },
    file_code: { type: "string", allowNull: true },
    product_type: { type: "string" },
    delivered_amount: { type: "string", allowNull: true },
    print_order_time: { type: "ref" },
    friend_discount: { type: "string" },
    balanceUtilize: { type: "string", allowNull: true },
    vendor_code: { type: "string", allowNull: true },
    priority: { type: "string" },
    login_id: { type: "string", allowNull: true },
    order_type: { type: "string" },
    opened_by: { type: "string" },
    cancelled_by: { type: "string", allowNull: true },
    order_created_date: { type: "ref" },
    pay_advance: { type: "string", allowNull: true },
    booking_type: { type: "string", allowNull: true },
    trax_tracking_number: { type: "string", allowNull: true },
    trax_response: { type: "string", allowNull: true },
    opened_by_time: { type: "ref" },
    trax_last_status: { type: "string" },
    trax_status_reason: { type: "string", allowNull: true },
    trax_status_object: { type: "string", allowNull: true },
    trax_amount_status: { type: "string" },
    trax_import_order_status: { type: "string" },
    trax_import_order_collection_amount: { type: "string" },
    trax_import_order_net_retained_amount: { type: "string" },
    trax_import_new_disbursement_amount: { type: "string" },
    trax_import_order_weight: { type: "string" },
    parent_order_id: { type: "string", allowNull: true },
    return_status: { type: "string" },
    trax_order_sent_json: { type: "string", allowNull: true },
    online_pay: { type: "number", allowNull: true },
    packed_by: { type: "string", allowNull: true },
    admin_status: { type: "string", allowNull: true },
    rider_logistics_order_sent_json: { type: "string", allowNull: true },
    rider_logistics_cnum: { type: "string", allowNull: true },
    rider_logistics_response: { type: "string", allowNull: true },
    confirmation_code: { type: "string", allowNull: true },
    payment_status_stripe: { type: "string" },
    payment_success_time: { type: "string", allowNull: true },
    order_source: { type: "string" },
    pre_cnno: { type: "string", allowNull: true },
    pre_cnno_price: { type: "string", allowNull: true },
    rider_last_status: { type: "string", allowNull: true },
    shopify_order: { type: "string", allowNull: true },
  },

  search: async (search, one = false) => {
    const rawSQL = `SELECT * FROM new_orders WHERE (id=$1 OR LOWER(temp_id)=$1 OR call_courier_cnno=$1 OR trax_tracking_number=$1 OR rider_logistics_cnum=$1) ORDER BY id DESC ${
      one ? "LIMIT 1" : ""
    };`;
    const rawResult = await OrderLocal.getDatastore().sendNativeQuery(rawSQL, [search.toLowerCase()]);

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
};
