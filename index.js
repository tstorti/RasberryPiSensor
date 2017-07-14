
var keys = require("./keys.js");
var firebase = require('firebase');
var BME280 = require('node-adafruit-bme280');
var moment = require("moment");

firebase.initializeApp(keys.firebaseKeys);

var currentTemp=null;
var currentHumidity=null;
var currentPressure=null;
console.log(moment().format("LTS"));

BME280.probe(function(temperature, pressure, humidity) {
	//temperature in C
	currentTemp = temperature;
	//pressure in pascals
	currentPressure = pressure;
	//percentage humidity
	currentHumidity = humidity;
	firebase.database().ref().child("test").set({
		"date": moment().format("L"),
		"time":moment().format("LTS"),
		"temperature": currentTemp,
		"humidity": currentHumidity,
		"pressure": currentPressure,
	});
  
});

