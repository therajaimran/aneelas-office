module.exports = {
  friendlyName: "Fetch Call Courier no details",

  inputs: {
    order_id: {
      type: "string",
    },
  },

  fn: async function ({ order_id }) {
    const axios = require("axios");

    try {
      const result = await axios.post(
        "https://apps.aneelas.pk/admin/ajaxs/updateCustomerOrdersHistory",
        { order_id },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        },
      );

      return result.data;
    } catch (e) {
      return { status: 400, data: e?.response?.data?.error };
    }
  },
};
