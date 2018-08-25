let Service;
let Characteristic;

const request = require('request');
const url = require('url');
 
module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-http-minisplit", "MiniSplit", miniSplit);
};

function miniSplit(log, config) {
  this.log = log;
  this.getUrl = url.parse(config['getUrl']);
  this.postUrl = url.parse(config['postUrl']);
}

miniSplit.prototype = {

  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Fujitsu")
      .setCharacteristic(Characteristic.Model, "Halcyon")
      .setCharacteristic(Characteristic.SerialNumber, "XXXXXX");
 
    let switchService = new Service.Switch("AC");
    switchService
      .getCharacteristic(Characteristic.On)
        .on('get', this.getSwitchOnCharacteristic.bind(this))
        .on('set', this.setSwitchOnCharacteristic.bind(this));
 
    this.informationService = informationService;
    this.switchService = switchService;
    return [informationService, switchService];
  },

  getSwitchOnCharacteristic: function (next) {
    const me = this;

    request({
        url: me.getUrl,
        method: 'GET',
    }, 
    function (error, response, body) {
      if (error) {
        me.log('STATUS: ' + response.statusCode);
        me.log(error.message);
        return next(error);
      }

      return next(null, body.isOn);
    });
  },
  
  setSwitchOnCharacteristic: function (on, next) {
    const me = this;
    const requestUrl = on ? me.postUrl.href + 'on' : me.postUrl.href + 'off';

    request({
      url: requestUrl,
      method: 'GET',
    },
    function (error, response) {
      if (error) {
        me.log('STATUS: ' + response.statusCode);
        me.log(error.message);
        return next(error);
      }
      return next();
    });

    // request({
    //   url: me.postUrl,
    //   body: JSON.stringify({ 'targetState': on }),
    //   method: 'POST',
    //   headers: {'Content-type': 'application/json'}
    // },
    // function (error, response) {
    //   if (error) {
    //     me.log('STATUS: ' + response.statusCode);
    //     me.log(error.message);
    //     return next(error);
    //   }
    //   return next();
    // });
  }
};
