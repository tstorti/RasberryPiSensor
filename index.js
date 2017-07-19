
var keys = require("./keys.js");
var firebase = require('firebase');
var BME280 = require('node-adafruit-bme280');
var moment = require("moment");


var app = {
	currentTemp:null,
	currentHumidity:null,
	currentPressure:null,
	sessionInterval:null,
	isCollecting:false,

	firebaseConnect:function(){

		firebase.initializeApp(keys.firebaseKeys);
		//set basic variables for new child in firebase
		firebase.database().ref().update({
			"isOnline":true,
		});
	},
	newSession:function(sessionName){
		//show selected event name
		firebase.database().ref().child("status").on("value", function(snapshot) {
			if(snapshot.val().isRecording === true && app.isCollecting ===false){
				console.log("collecting data");
				app.collectData(snapshot.val().current_session);
			}
			else if(snapshot.val().isRecording ===false){
				console.log("stopping data collection");
				clearInterval(app.sessionInterval);
				app.isCollecting=false;
			}
		});
	},
	collectData:function(sessionKey){	
		this.isCollecting = true;
		this.sessionInterval=setInterval(function(){
			BME280.probe(function(temperature, pressure, humidity) {
				//temperature in C
				app.currentTemp = temperature;
				//pressure in pascals
				app.currentPressure = pressure;
				//percentage humidity
				app.currentHumidity = humidity;
				
				firebase.database().ref().child("historic_sessions").child(sessionKey).child("data").child(moment().format("YYYY-MM-DD HH:mm:ss")).set({
					"timestamp":moment().format("YYYY-MM-DD HH:mm:ss"),
					"temperature": app.currentTemp,
					"humidity": app.currentHumidity,
					"pressure": app.currentPressure,
				});	
			});			
		},5000);
	},
};

app.firebaseConnect();
app.newSession();



