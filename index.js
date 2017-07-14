
var keys = require("./keys.js");
var firebase = require('firebase');


firebase.initializeApp(keys.firebaseKeys);

//set basic variables for new child in firebase
firebase.database().ref().child("test").set({
	"name": "test record"
});