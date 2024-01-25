/**
 * Datastores
 * (sails.config.datastores)
 *
 * A set of datastore configurations which tell Sails where to fetch or save
 * data when you execute built-in model methods like `.find()` and `.create()`.
 *
 *  > This file is mainly useful for configuring your development database,
 *  > as well as any additional one-off databases used by individual models.
 *  > Ready to go live?  Head towards `config/env/production.js`.
 *
 * For more information on configuring datastores, check out:
 * https://sailsjs.com/config/datastores
 */

module.exports.datastores = {
  default: {
    timezone: "Z",
    adapter: "sails-mysql",
    url: "mysql://ofc_admin:beddaz-wiNwar-netmu4@192.168.10.220:3306/annaya",
  },

  liveDB: {
    timezone: "Z",
    adapter: "sails-mysql",
    url: "mysql://aws_sails_oknasir:ryrreR8]butgicytzex@18.141.200.76:3306/annaya",
  },
};
