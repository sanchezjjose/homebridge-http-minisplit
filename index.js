let Service;
let Characteristic;

const request = require('request');
const url = require('url');
 
module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-http-minisplit", "MiniSplit", miniSplit);
};

const celsiusToFahrenheit = (temp) => {
  return (temp * 1.8) + 32;
};

const fahrenheitToCelsius = (temp) => {
	return (temp - 32) / 1.8;
}

function miniSplit (log, config) {
  this.log = log;
  this.getUrl = url.parse(config['getUrl']);
  this.postUrl = url.parse(config['postUrl']);
};

miniSplit.prototype = {

  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Fujitsu")
      .setCharacteristic(Characteristic.Model, "Halcyon")
      .setCharacteristic(Characteristic.SerialNumber, "XXXXXX");
 
    let thermostat = new Service.Thermostat("AC");
    thermostat
      .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
        .on('get', this.getCurrentHeatingCoolingState.bind(this))
 
    thermostat
      .getCharacteristic(Characteristic.TargetHeatingCoolingState)
        .on('get', this.getTargetHeatingCoolingState.bind(this))
        .on('set', this.setTargetHeatingCoolingState.bind(this));

    thermostat
      .getCharacteristic(Characteristic.CurrentTemperature)
        .on('get', this.getCurrentTemperature.bind(this))

    thermostat
      .getCharacteristic(Characteristic.TargetTemperature)
        .on('get', this.getTargetTemperature.bind(this))
        .on('set', this.setTargetTemperature.bind(this));

    thermostat
      .getCharacteristic(Characteristic.TemperatureDisplayUnits)
        .on('get', this.getTemperatureDisplayUnits.bind(this))
        .on('set', this.setTemperatureDisplayUnits.bind(this));

    thermostat.getCharacteristic(Characteristic.CurrentTemperature)
      .setProps({
        unit: Characteristic.Units.FAHRENHEIT,
        minValue: parseFloat(fahrenheitToCelsius(60).toFixed(1)),
        maxValue: parseFloat(fahrenheitToCelsius(88).toFixed(1)),
        minStep: 1.1
      });
      // .setProps({
      //   unit: Characteristic.Units.FAHRENHEIT,
      //   minValue: 15.5556,
      //   maxValue: 31.1111,
      //   minStep: 2
      // });

    thermostat.getCharacteristic(Characteristic.TargetTemperature)
      .setProps({
        unit: Characteristic.Units.FAHRENHEIT,
        minValue: parseFloat(fahrenheitToCelsius(60).toFixed(1)),
        maxValue: parseFloat(fahrenheitToCelsius(88).toFixed(1)),
        minStep: 1.1
      });
      // .setProps({
      //   unit: Characteristic.Units.FAHRENHEIT,
      //   minValue: 15.5556,
      //   maxValue: 31.1111,
      //   minStep: 2
      // }); 

    this.informationService = informationService;
    this.thermostat = thermostat;
    return [informationService, thermostat];
  },

  getCurrentHeatingCoolingState: (next) => {
    console.log('getCurrentHeatingCoolingState called...');
    next(null, Characteristic.CurrentHeatingCoolingState.COOL);
  },

  getTargetHeatingCoolingState: (next) => {
    console.log('getTargetHeatingCoolingState called...');
    next(null, Characteristic.TargetHeatingCoolingState.COOL);
  },
  
  setTargetHeatingCoolingState: (value, next) => {
    console.log('setTargetHeatingCoolingState called...');
    console.log(value);

    next(null, value);
  },

  getCurrentTemperature: (next) => {
    console.log('getCurrentTemperature called...');
    // next(null, 21.1111);
    const temp = fahrenheitToCelsius(68);
    console.log(temp);
    next(null, temp);
  },

  getTargetTemperature: (next) => {
    console.log('getTargetTemperature called...');
    // next(null, 21.1111);
    const temp = fahrenheitToCelsius(68);
    console.log(temp);
    next(null, temp);
  },

  setTargetTemperature: (value, next) => {
    console.log('setTargetTemperature called...');
    console.log(value);
    console.log(Math.round(celsiusToFahrenheit(value + 0.4)));

    next(null, value);
  },
  
  getTemperatureDisplayUnits: (next) => {
    console.log('getTemperatureDisplayUnits called...');
    next(null, Characteristic.TemperatureDisplayUnits.FAHRENHEIT);
  },

  setTemperatureDisplayUnits: (value, next) => {
    console.log('setTemperatureDisplayUnits called...');
    console.log(value);

    next(null, value);
  }

  // getMode: function (next) {
  //   const me = this;

  //   request({
  //       url: me.getUrl,
  //       method: 'GET',
  //   }, 
  //   function (error, response, body) {
  //     if (error) {
  //       me.log('STATUS: ' + response.statusCode);
  //       me.log(error.message);
  //       return next(error);
  //     }

  //     const currentSettings = JSON.parse(body).settings;
  //     console.log('AC Status: ', currentSettings);

  //     // Check currentSettings.mode for true state
  //     return next(null, Characteristic.CurrentHeatingCoolingState.COOL);
  //   });
  // },
  
  // setMode: function (on, next) {
  //   const me = this;
  //   const requestUrl = on ? me.postUrl.href + 'on' : me.postUrl.href + 'off';
  
  //   request(requestUrl, (error, response, body) => {
  //     if (error) {
  //       me.log('STATUS: ' + response.statusCode);
  //       me.log(error.message);
  //       return next(error);
  //     }

  //     return next();
  //   });

  //   // request({
  //   //   url: me.postUrl,
  //   //   body: JSON.stringify({ 'targetState': on }),
  //   //   method: 'POST',
  //   //   headers: {'Content-type': 'application/json'}
  //   // },
  //   // function (error, response) {
  //   //   if (error) {
  //   //     me.log('STATUS: ' + response.statusCode);
  //   //     me.log(error.message);
  //   //     return next(error);
  //   //   }
  //   //   return next();
  //   // });
  // }
};
