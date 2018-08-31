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

const sendRequest = (log, url, method) => {
    return new Promise((resolve, reject) => {
      console.log(`Sending request to ${url}`);

      request({
          url: url,
          method: method

      }, function (error, response, body) {
        if (error) {
          log('STATUS: ' + response.statusCode);
          log(error.message);

          return reject(error);
        }

        const status = JSON.parse(body);
        console.log('AC Status: ', status);

        return resolve(status);
      });
    });
}

class miniSplit {

  constructor(log, config) {
    this.log = log;
    this.getUrl = url.parse(config['getUrl']);
    this.postUrl = url.parse(config['postUrl']);

    this.currentTemp = '70';
  }

  getServices() {
    const informationService = new Service.AccessoryInformation();
    const thermostat = new Service.Thermostat("AC");

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Fujitsu")
      .setCharacteristic(Characteristic.Model, "Halcyon")
      .setCharacteristic(Characteristic.SerialNumber, "XXXXXX");

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

    thermostat.getCharacteristic(Characteristic.TargetTemperature)
      .setProps({
        unit: Characteristic.Units.FAHRENHEIT,
        minValue: parseFloat(fahrenheitToCelsius(60).toFixed(1)),
        maxValue: parseFloat(fahrenheitToCelsius(88).toFixed(1)),
        minStep: 1.1
      });

    return [informationService, thermostat];
  }

  getCurrentHeatingCoolingState(next) {
    console.log('getCurrentHeatingCoolingState called...');

    sendRequest(this.log, this.getUrl.href + `status`, 'GET').then(status => {
      switch(status.settings.mode) {
        case 'cool':
          next(null, Characteristic.TargetHeatingCoolingState.COOL);
          break;
        case 'heat':
          next(null, Characteristic.TargetHeatingCoolingState.HEAT);
          break;
        case 'dry':
          next(null, Characteristic.TargetHeatingCoolingState.AUTO);
          break;
        default:
          next(null, Characteristic.TargetHeatingCoolingState.OFF);
          break;
      }
    });
  }

  getTargetHeatingCoolingState(next) {
    console.log('getTargetHeatingCoolingState called...');

    sendRequest(this.log, this.getUrl.href + `status`, 'GET').then(status => {
      switch(status.settings.mode) {
        case 'cool':
          next(null, Characteristic.TargetHeatingCoolingState.COOL);
          break;
        case 'heat':
          next(null, Characteristic.TargetHeatingCoolingState.HEAT);
          break;
        case 'dry':
          next(null, Characteristic.TargetHeatingCoolingState.AUTO);
          break;
        default:
          next(null, Characteristic.TargetHeatingCoolingState.OFF);
          break;
      }
    });
  }
  
  setTargetHeatingCoolingState(value, next) {
    console.log('setTargetHeatingCoolingState called...');

    let mode;
    let requestUrl;

    switch(value) {
      case Characteristic.TargetHeatingCoolingState.COOL:
        mode = 'cool';
        requestUrl = this.getUrl.href + `set?mode=${mode}`;
        break;
      case Characteristic.TargetHeatingCoolingState.HEAT:
        mode = 'heat';
        requestUrl = this.getUrl.href + `set?mode=${mode}`;
        break;
      case Characteristic.TargetHeatingCoolingState.AUTO:
        mode = 'dry';
        requestUrl = this.getUrl.href + `set?mode=${mode}`;
        break;
      case Characteristic.TargetHeatingCoolingState.OFF:
        mode = 'off';
        requestUrl = this.getUrl.href + 'off';
        break;
    }

    sendRequest(this.log, requestUrl, 'GET').then(status => {
      next(null, value);
    });
  }

  getCurrentTemperature(next) {
    console.log('getCurrentTemperature called...');

    sendRequest(this.log, this.getUrl.href + 'status', 'GET').then(status => {
      next(null, fahrenheitToCelsius(status.settings.temp));
    });
  }

  getTargetTemperature(next) {
    console.log('getTargetTemperature called...');
    
    sendRequest(this.log, this.getUrl.href + 'status', 'GET').then(status => {
      next(null, fahrenheitToCelsius(status.settings.temp));
    });
  }

  setTargetTemperature(value, next) {
    console.log('setTargetTemperature called...');
    const temp = Math.round(celsiusToFahrenheit(value + 0.4));

    sendRequest(this.log, this.getUrl.href + `set?temp=${temp}`, 'GET').then(status => {
      next(null, fahrenheitToCelsius(status.settings.temp));
    });
  }
  
  getTemperatureDisplayUnits(next) {
    next(null, Characteristic.TemperatureDisplayUnits.FAHRENHEIT);
  }

  setTemperatureDisplayUnits(value, next) {
    next(null, value);
  }
};
