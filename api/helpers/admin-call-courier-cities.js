module.exports = {
  friendlyName: "Admin call courier cities",

  fn: async function () {
    const axios = require("axios");

    try {
      const result = await axios.get("https://apps.aneelas.pk/admin/scripts/cities.json");

      return result.data;
    } catch (e) {
      return { status: 400, data: e?.response?.data?.error };
    }
  },
};
