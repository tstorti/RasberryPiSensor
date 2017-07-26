
var keys = require("./keys.js");
var firebase = require('firebase');
var BME280 = require('node-adafruit-bme280');
var gpio = require("rpi-gpio");
var moment = require("moment");


var app = {
	currentTemp:null,
	currentHumidity:null,
	currentPressure:null,
	sessionInterval:null,
	isCollecting:false,
	sensorKey:null,

	firebaseConnect:function(){
		//initialize connection to firebase application
		firebase.initializeApp(keys.firebaseKeys);
		
		//set connected status and update sensor section to include this device for webclient users
		firebase.database().ref(".info/connected").on("value",function(snapshot){
			if(snapshot.val() === true){
				console.log(keys.sensorID.id);
				console.log("connected to firebase");
				
				var connection = firebase.database().ref("status/connections/sensors").push();
				var sensor = firebase.database().ref("sensors").child(keys.sensorID.id);
				
				//if device is disconnected from firebase, remove connections so webclient will not try to record new data
				connection.onDisconnect().remove();
				sensor.onDisconnect().remove();
				
				connection.set(true);
				
				//set initial status for device on firebase
				sensor.set({
					"id": keys.sensorID.id,
					"isRecording":false,
					"currentSession":null,
				});
				app.connectionLightOn();
				app.newSession();
			}
		});

	},
	newSession:function(sessionName){
		//set up watcher for sensor if firebase status is changed by webclient
		firebase.database().ref().child("sensors").child(keys.sensorID.id).on("value", function(snapshot) {
			//collect data
			if(snapshot.val().isRecording === true && app.isCollecting ===false){
				console.log("collecting data");
				app.collectData(snapshot.val().current_session);
			}
			//stop collecting data
			else if(snapshot.val().isRecording ===false){
				console.log("stopping data collection");
				clearInterval(app.sessionInterval);
				app.isCollecting=false;
				app.collectionLightOff();
			}
		});
	},
	collectData:function(sessionKey){
		this.collectionLightOn();	
		this.isCollecting = true;
		//every 5 seconds add new data point
		this.sessionInterval=setInterval(function(){
			BME280.probe(function(temperature, pressure, humidity) {
				//temperature in C
				app.currentTemp = temperature;
				//pressure in pascals
				app.currentPressure = pressure;
				//percentage humidity
				app.currentHumidity = humidity;
				
				//push new child to the data section of the session with sensor data (current timestamp is key)
				firebase.database().ref().child("historic_sessions").child(sessionKey).child("data").child(moment().format("YYYY-MM-DD HH:mm:ss")).set({
					"sensorID":keys.sensorID.id,
					"timestamp":moment().format("YYYY-MM-DD HH:mm:ss"),
					"temperature": app.currentTemp,
					"humidity": app.currentHumidity,
					"pressure": app.currentPressure,
				});	
			});			
		},5000);
	},
	collectionLightOn:function(){
		gpio.write(11,true);
	},
	collectionLightOff:function(){
		gpio.write(11,false);
	},
	connectionLightOn:function(){
		gpio.write(12,true);
	},
	connectionLightOff:function(){
		gpio.write(12,false);
	},
};
//turn off status lights to init state
gpio.setup(11,gpio.DIR_OUT,app.collectionLightOff);
gpio.setup(12,gpio.DIR_OUT,app.connectionLightOff);

//connect to firebase and init app
app.firebaseConnect();



