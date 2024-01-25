module.exports = {
  friendlyName: "Create rider logistics consignee no",

  inputs: {
    total: {
      type: "number",
      required: true,
    },
    username: {
      type: "string",
      required: true,
    },
    orderId: {
      type: "number",
      required: true,
    },
    phone: {
      type: "string",
      required: true,
    },
    address: {
      type: "string",
      required: true,
    },
    totalItems: {
      type: "number",
      required: true,
    },
    cityId: {
      type: "string",
      required: true,
    },
    weight: {
      type: "string",
    },
    description: {
      type: "string",
    },
  },

  fn: async function ({ total, username, orderId, phone, address, totalItems, weight, cityId, description }) {
    const axios = require("axios");

    try {
      const urlsParse = [
        "loginId=2805",
        `ConsigneeName=${username}`,
        `ConsigneeRefNo=${orderId}`,
        `ConsigneeCellNo=${phone}`,
        `Address=${address}`,
        "OriginCityName=LHE",
        `DestCityName=${cityId}`,
        "ServiceTypeId=1", // 1=COD, 2=NON-COD
        "DeliveryTypeId=2", // 1=Same Day Delivery, 2=1-3 Days Delivery
        `Pcs=${totalItems}`,
        `Weight=${weight}`,
        `Description=${description}`,
        `CodAmount=${total}`,
        "ShipperAddress=195+E+Pak+Arab+Society+Lahore",
        "vendorAddress=195+E+Pak+Arab+Society+Lahore",
        "vendorPhone=03214288423",
        "apikey=zo(dCn4$LrMrPNaJ3dTbJzCtBCaiATBBwCwvFu0jT1pyExb!g)Bh7GI)0TQ)mWM6",
      ];

      console.log(urlsParse);

      const result = await axios.get(`http://api.withrider.com/rider/v2/SaveBooking?${encodeURI(urlsParse.join("&"))}`);

      return result.data;
    } catch (e) {
      return { status: 400, data: e?.response?.data?.error };
    }
  },
};
