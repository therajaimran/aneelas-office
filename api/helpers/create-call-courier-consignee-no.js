module.exports = {
  friendlyName: "Create cc consignee no",

  inputs: {
    total: {
      type: "number",
      required: true,
    },
    username: {
      type: "string",
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
    city: {
      type: "string",
      required: true,
    },
    cityId: {
      type: "number",
      required: true,
    },
    description: {
      type: "string",
      required: true,
    },
  },

  fn: async function ({ total, username, phone, address, city, cityId, description }) {
    const axios = require("axios");

    try {
      const loginTypes = {
        meezan: "LHR-03767",
        cod: "LHE-19918",
      };

      let serviceType = 7;
      if (total === 0) {
        serviceType = 1;
      }

      const urlsParse = [
        `loginId=${total < 2500 ? loginTypes["meezan"] : loginTypes["cod"]}`,
        `ConsigneeName=${username}`,
        `ConsigneeRefNo=${phone.slice(2)}`,
        `ConsigneeCellNo=${phone}`,
        `Address=${username} Address ${address} City ${city.toUpperCase()}`,
        "Origin=Lahore",
        `DestCityId=${cityId}`,
        `ServiceTypeId=${serviceType}`,
        "Pcs=1",
        "Weight=1",
        `Description=${description}`,
        "SelOrigin=Domestic",
        `CodAmount=${total}`,
        "SpecialHandling=false",
        "MyBoxId=1",
        "Holiday=false",
        "remarks=...",
        "ShipperName=Branded+Items+%28Aneela%27s+Collection%29",
        "ShipperCellNo=03214288423",
        "ShipperArea=339",
        "ShipperCity=1",
        "ShipperAddress=195+E+Pak+Arab+Society+Lahore",
        "ShipperLandLineNo=04235463139",
        "ShipperEmail=rajaimran@live.com",
      ];

      const result = await axios.get(`https://cod.callcourier.com.pk/api/CallCourier/SaveBooking?${encodeURI(urlsParse.join("&"))}`);

      return result.data;
    } catch (e) {
      return { status: 400, data: e?.response?.data?.error };
    }
  },
};
