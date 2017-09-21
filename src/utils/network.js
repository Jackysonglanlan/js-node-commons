'use strict';

let networkInterfaces = require('os').networkInterfaces();

const LOCAL_NETWORK_IP_SEGMENTS = ['10.', '172.', '192.'];

function _isLocalNetworkAddress(ip) {
  for (let prefix of LOCAL_NETWORK_IP_SEGMENTS) {
    if (ip.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

/**
 * Get all ipv4 address from system.
 * @returns {Array}
 */
module.exports.getIpAddress = () => {
  return _.chain(networkInterfaces)
    .map()
    .flatten()
    .filter(s => s.family === 'IPv4' && s.internal === false)
    .map(s => s.address)
    .value();
};

/**
 * Get first local ipv4 address.
 * @returns {string}
 */
module.exports.getLocalIpAddress = () => {
  return _.chain(module.exports.getIpAddress()).filter(ip => _isLocalNetworkAddress(ip)).first().value();
};

/**
 * Get first public ipv4 address.
 * @returns {string}
 */
module.exports.getPublicIpAddress = () => {
  return _.chain(module.exports.getIpAddress()).filter(ip => !_isLocalNetworkAddress(ip)).first().value();
};

const ValidIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

module.exports.getClientIp = req => {
  let ipAddress = req.connection.remoteAddress;

  // log('--------', ipAddress);

  ipAddress = ipAddress.split(':').pop();
  if (ipAddress && ipAddress.match(ValidIpAddressRegex)) {
    return ipAddress;
  }

  ipAddress = (req.headers['x-forwarded-for'] || '').split(',')[0];

  // log('----.////----', ipAddress);

  if (ipAddress && ipAddress.match(ValidIpAddressRegex)) {
    return ipAddress;
  }

  // shouldn't happen
  return '127.0.0.1'; // can't get client ip, use default
};
