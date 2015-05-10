var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var global = {
	'data': []
};

server.listen(8888);
console.log('Server started');

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
	socket.emit('addDataQTA', global.data);
	socket.on('dataQTA', function (data) {
		switch(data.control) {
			case 'add': {
				global.data.push({"question": data.dt, "answer": ""});
				io.emit('changeDataQTA', data);
			}; break;

			case 'change': {
				global.data[data.id] = data.dt;
				io.emit('changeDataQTA', data);
			}; break;
		} 
	});
});