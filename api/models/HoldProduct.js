/**
 * HoldProduct.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "hold_products",

  attributes: {
    device: {
      type: "string",
      required: true,
      columnName: "device_id",
      columnType: "varchar(100)",
    },

    product: {
      type: "number",
      required: true,
      columnName: "product_id",
      columnType: "int unsigned",
    },

    updatedAt: {
      type: "ref",
      autoUpdatedAt: true,
      columnType: "datetime",
      columnName: "updated_at",
    },

    createdAt: {
      type: "ref",
      autoCreatedAt: true,
      columnType: "datetime",
      columnName: "created_at",
    },
  },
};
