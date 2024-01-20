module.exports = {
  friendlyName: "Send whatsapp message",

  inputs: {
    phone: {
      type: "string",
    },
    message: {
      type: "string",
    },
  },

  fn: async function ({ message, phone }) {
    const axios = require("axios");

    try {
      const result = await axios.post(
        "https://social.aneelas.pk/social/send_whatsapp_message",
        { message, phone },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return result.data;
    } catch (e) {
      return { status: 400, data: e?.response?.data?.error };
    }
  },
};
