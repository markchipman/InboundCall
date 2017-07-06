var Bandwidth = require("node-bandwidth");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var http = require("http").Server(app);

//Bandwidth Credentials 
var client = new Bandwidth({
	userId    : process.env.BANDWIDTH_USER_ID, 
	apiToken  : process.env.BANDWIDTH_API_TOKEN,
	apiSecret : process.env.BANDWIDTH_API_SECRET
});

app.use(bodyParser.json());
app.set('port', (process.env.PORT || 3000));

/*********** Inbound Calls  ***********/
app.get("/", function (req, res) {
    console.log(req); 
    res.send("Text on Website");
    //res.send(can be a website); ***Reroutes to other website?
});
http.listen(app.get('port'), function(){
    //once done loading then do this (callback)
    console.log('listening on *:' + app.get('port'));
});
app.post("/call-callback", function (req, res){
	var body = req.body;
	res.sendStatus(200);
//If the number ‘answers’, speak sentence
	if (body.eventType === "answer"){
		client.Call.speakSentence(body.callId, "Voice message here.")
		.then(function (res) {
			console.log("speakSentence sent");
		})
		.catch(function (err){
			console.log(err);
		});
	}
	//If message has been spoken, and the playback has stopped, hang up call
	else if (body.eventType === "speak" && body.state === "PLAYBACK_STOP"){
		client.Call.hangup(body.callId)
		.then(function (){
			console.log("Hanging up call");
		})
		.catch(function (err){
			console.log("Error hanging up the call, it was probably already over.");
			console.log(err);
		});
	}
	else{
		console.log(body);
	}
	//Default: print out body
});

