var express = require('express')
var path = require('path')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));

http.listen(3300)

io.on('connection',function(socket){
	socket.on('calculate', function(result){
		io.emit('calculate',result)
  	});
});

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/public/calculator.html'));
});