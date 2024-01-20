module.exports = {
  friendlyName: "Fetch Call Courier no details",

  inputs: {
    cnno: {
      type: "string",
    },
  },

  fn: async function ({ cnno }) {
    const axios = require("axios");

    try {
      const result = await axios.get(`https://cod.callcourier.com.pk/api/CallCourier/GetTackingHistory?cn=${cnno}`);

      return result.data;
    } catch (e) {
      return { status: 400, data: e?.response?.data?.error };
    }
  },
};
