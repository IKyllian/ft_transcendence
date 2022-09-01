var express = require('express');
var app = express();

var server = require('http').createServer(app);

app.get('/',function(_req: any, res:any) {
	res.sendFile(__dirname + '/static/index.html');

});
app.use('/static',express.static(__dirname + '/static'));

console.log("Server started.");


server.listen(4141);