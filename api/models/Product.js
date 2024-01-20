/**
 * @class Product
 * @mixes {Waterline~Model}
 */

module.exports = {
  tableName: "products_inventory",

  attributes: {
    name: {
      required: true,
      type: "string",
      columnName: "name",
    },

    thumb: {
      required: true,
      type: "string",
      columnName: "thumbnail_url",
    },

    video: {
      required: true,
      type: "string",
      columnName: "self_video",
    },
  },
};
