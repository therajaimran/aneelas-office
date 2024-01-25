module.exports = {
  friendlyName: "Admin rider logistics cities",

  fn: async function () {
    const axios = require("axios");

    try {
      const result = await axios.get("https://apps.aneelas.pk/admin/scripts/rider_logistics_cites.json");

      return result.data;
    } catch (e) {
      return { status: 400, data: e?.response?.data?.error };
    }
  },
};
