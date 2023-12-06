function createNonceStr() {
  return Math.random().toString(36).substr(2, 15);
};

function createTimestamp() {
  return parseInt(new Date().getTime() / 1000) + '';
};

function raw(args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

function sign(jsapi_ticket, url) {
  var ret = {
    jsapi_ticket: jsapi_ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url
  };
  var string = raw(ret);
  jsSHA = require('jssha');
  shaObj = new jsSHA('SHA-1', 'TEXT');
  shaObj.update(string)
  ret.signature = shaObj.getHash('HEX');

  return ret;
};

module.exports = sign;
