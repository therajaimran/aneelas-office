/**
 * is-aneelas
 *
 * A simple policy that blocks requests from non-admins.
 */

module.exports = function (req, res, proceed) {
  const userIP = req.header("x-forwarded-for");

  const allowedIPs = ["103.154.65.102", "103.154.65.241", "139.135.59.82"];

  if ((userIP && allowedIPs.includes(userIP)) || sails.config.environment === "development") {
    return proceed();
  }

  return res.notFound();
};
