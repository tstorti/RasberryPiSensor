
var keys = require("./keys.js");
var firebase = require('firebase');
var BME280 = require('node-adafruit-bme280');
var moment = require("moment");


var app = {
	currentTemp:null,
	currentHumidity:null,
	currentPressure:null,
	sessionInterval:null,
	isCollecting:null,

	firebaseConnect:function(){
		//check out below link for managing isOnline
		/*https://firebase.google.com/docs/database/web/offline-capabilities*/

		firebase.initializeApp(keys.firebaseKeys);
		//set basic variables for new child in firebase
		firebase.database().ref().update({
			"isOnline":true,
		});
	},
	newSession:function(sessionName){
		//show selected event name
		firebase.database().ref().on("value", function(snapshot) {
			if(snapshot.val().current_session !== "off" && app.isCollecting ===false){
				console.log("collecting data");
				app.collectData(snapshot.val().current_session);
			}
			else if(snapshot.val().current_session ==="off"){
				console.log("stopping data collection");
				clearInterval(app.sessionInterval);
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



