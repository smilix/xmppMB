"use strict";

var express = require('express');
var dateFormat = require('dateformat');
var util = require('util');

var config = require('./config.js');
var XmppClient = require('./XmppClient.js');
var RssBuilder = require('./RssBuilder.js');

var client = new XmppClient({
  config : config
// , debug: true
});

var feedBuilder = new RssBuilder({
  siteUrl: config.siteUrl,
  feedUrl: config.siteUrl + '/rssFeed'
});

var app = module.exports = express.createServer();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view options', {
    layout : false
  });
  app.use(function (req, res, next) {
    res.removeHeader("X-Powered-By");
    next();
  });   
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger(':date :method :status :url :referrer :user-agent'));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions : true,
    showStack : true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// sites

app.post('/newMessage', function(req, res) {
  var ip = req.connection.remoteAddress;
  if (!ip) {
    util.log("Error: Can't determine client ip.");
    res.json({status: 1, msg: "Internal server error."});
    return;
  }
  
  var name = config.validPoster[ip];
  if (!name) {
    util.log(util.format("Warn: Unknown ip address %s. You may upate the configuration.", ip));
    res.json({status: 2, msg: "You are not allowed to post."});
    return;
  }
  var msg = req.body.msg;
  
  util.log(util.format("%s (%s) posts: '%s'", name, ip, msg));
  client.send(name, msg);
  res.json({status: 0, msg: ""});
});

app.get('/chat-stream', function(req, res) {
  req.socket.setTimeout(0);

  writeStreamHeaders(res, req);
  
  var messageCount = 0;
  client.on('message', function(msg, index) {
    writeEvent(res, 'message', messageCount++, JSON.stringify(prepareMsgForClient(msg)));
  });
  
   var keepalive = setInterval(function() { writeEvent(res, "keepalive", messageCount++, 1); }, config.streamKeepAliveIntervalInSec * 1000);
});

app.get('/allMessages', function(req, res) {
  // send all recieved messages to the client
  var msg = client.getMessages();
  var result = [];
  for (var i=0; i<msg.length; i++) {
    result.push(prepareMsgForClient(msg[i]));
  }
  res.json(result);
});

app.get('/rssFeed', function(req, res) {
  res.charset = 'UTF-8';
  res.contentType('text/xml');
  var feedData = feedBuilder.getFeed(client.getMessages());
  res.send(feedData);
});

app.listen(config.listenOnPort);
util.log(util.format("Express server listening on port %d in %s mode", app.address().port, app.settings.env));

// do the connect as last action, to ensure a propper startet webserver
client.connect();


/* help functions */

function writeEvent(res, channel, messageId, message) {
  res.write('event: ' + channel + '\n' + 'id: ' + messageId + '\n' + 'data: ' + message + '\n\n');
}

function writeStreamHeaders(res, req) {
  res.writeHead(200, {
    'Content-Type' : 'text/event-stream',
    'Cache-Control' : 'no-cache',
    'Connection' : 'keep-alive',
    'Access-Control-Allow-Origin' : '*'
  });

  if (req.headers['user-agent'].indexOf("MSIE") >= 0) {
    res.write(':' + Array(2049).join(' ')); // 2kb padding for IE
  }
  res.write('\n');
}

function prepareMsgForClient(item) {
  return {
      sender: item.sender, 
      date: dateFormat(item.date, config.htmlClientDateFormat),
      msg: item.msg
  };
}
