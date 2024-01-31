/**
 * @class RackItem
 * @mixes {Waterline~Model}
 */

module.exports = {
  tableName: "manage_racks_items",

  attributes: {
    rack_id: { type: "number" },
    item_id: { type: "number", allowNull: true },
    rack_name: { type: "string", allowNull: true },
    added_by: { type: "string", allowNull: true },
    item_quantity: { type: "number" },
    added_date: { type: "ref" },
  },
};
