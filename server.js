var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var bodyParser = require('body-parser');
var app = express();
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};

  app.get('/', function (req, res) {
    res.send("Get Index");
  });
  app.use(bodyParser());
  app.use('/', express.static('./html', {maxAge: 60*60*1000}));
   app.get('/getcity', function (req, res) {
    console.log("In getcity route");
    fs.readFile("cities.dat.txt",function(err,data){
	if (err) throw err;
	console.log(req.query);
	var cities = data.toString().split("\n");
	var jsonresult = [];
	for (var i = 0; i < cities.length; i++){
	  var myRe = new RegExp("^"+req.query["q"]);
	  var result = cities[i].search(myRe);
	  if (result != -1){
	   jsonresult.push({city:cities[i]});
	  }
	}
      	res.writeHead(200);
      	res.end(JSON.stringify(jsonresult));
    });
  });
  app.get('/comment', function (req, res) {
   var MongoClient = require('mongodb').MongoClient;
   MongoClient.connect("mongodb://localhost/weather", function(err, db) {
   if(err) throw err;
   db.collection("comments",function(err,comments){
    if(err) throw err;
    comments.find(function(err,items){
     items.toArray(function(err, itemArr){
      res.writeHead(200);
      res.end(JSON.stringify(itemArr));
     });
    });
   });
  });
   console.log("In comment route");
  });
  var basicAuth = require('basic-auth-connect');
  var auth = basicAuth(function(user,pass){
    return((user ==='cs360')&&(pass === 'test'));
  });
  app.post('/comment',auth, function (req, res) {
    console.log("In POST comment route");
    console.log(req.body);
    
    //write to database
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://localhost/weather",function(err,db){
   	if(err) throw err;
	db.collection('comments').insert(req.body, function(err,records){
	  console.log("Record added as " + records[0]._id);
	});
    });
    res.writeHead(200);
    res.end();
    console.log("finished post");
  });
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);
