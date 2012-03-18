/**
 * The logic for the jabber client connection
 */
"use strict";

var xmpp = require('node-xmpp');
var util = require('util');
var events = require('events');
var StringUtils = require('./StringUtils.js');

function XmppClient(params) {
  events.EventEmitter.call(this);
  var self = this;

  this._config = params.config;
  this._debug = params.debug;
  // all recieved messages
  // { time, sender, msg }
  this._messages = [];

  this._hasRoomEntered = false;
  this._sendOnRoomEntered = [];
};

// inherit events.EventEmitter
XmppClient.super_ = events.EventEmitter;
XmppClient.prototype = Object.create(events.EventEmitter.prototype, {
  constructor : {
    value : XmppClient,
    enumerable : false
  }
});

module.exports = XmppClient;

XmppClient.prototype.getMessages = function() {
  var self = this;
  return self._messages;
};

/**
 * Connects to the jabber server AND enters the configured room. Sends also any queued messages.
 */
XmppClient.prototype.connect = function() {
  var self = this;
  
  this.cl = new xmpp.Client({
    jid : this._config.xmpp.jid,
    password : this._config.xmpp.password
  });

  if (this._debug) {
    // Log all data received
    this.cl.on('data', function(d) {
      util.log("[data in] " + d);
    });
  }
  
  // Once connected, set available presence and join room
  self.cl.on('online', function() {
    util.log("We're online!");

    // set ourselves as online
    self.cl.send(new xmpp.Element('presence', {
      type : 'available'
    }).c('show').t('chat'));

    // join room (and request no chat history)
    self.cl.send(new xmpp.Element('presence', {
      to : self._config.xmpp.roomJid + '/' + self._config.xmpp.roomNick
    }).c('x', {
      xmlns : 'http://jabber.org/protocol/muc'
    }));

    // send queued events
    self._hasRoomEntered = true;
    self._sendOnRoomEntered.forEach(function sendQueued(item) {
      self.send(item.nick, item.msg);
    });
    self._sendOnRoomEntered = [];

    // send keepalive data or server will disconnect us after 150s of
    // inactivity
    setInterval(function() {
      self.cl.send(' ');
    }, 30000);
  });

  self.cl.on('stanza', onMessageRecieved);

  function onMessageRecieved(stanza) {
    // always log error stanzas
    if (stanza.attrs.type == 'error') {
      util.log('[error] ' + stanza);
      return;
    }

    // ignore everything that isn't a room message
    if (!stanza.is('message') || !stanza.attrs.type == 'groupchat') {
      return;
    }

    // ignore messages we sent
    // if (stanza.attrs.from == self.config.roomJid + '/' +
    // self.config.roomNick) {
    // return;
    // }

    var body = stanza.getChild('body');
    // message without body is probably a topic change
    if (!body) {
      return;
    }
    var message = body.getText();
    var sender = StringUtils.substringAfterLast(stanza.from, '/');
    // no message if we don't have a sender's name
    // most likely this is a channel topic
    if (StringUtils.isEmpty(sender)) {
      return;
    }
    
    if (sender === self._config.xmpp.roomNick) {
      // a message by this bot, replace the sender with client sender (encoded in the message)
      var index = message.indexOf(':');
      if (index !== -1) {
        sender = message.substring(0, index);
        message = message.substring(index+2);
      }
    } 

    var delay = stanza.getChild('delay');
    var newMsg;
    if (delay) {
      // history group chat message
      newMsg = {
        date : new Date(Date.parse(delay.attrs.stamp) - self._config.timezoneOffset),
        sender : sender,
        msg : message
      };
      // util.log('Recieved history group chat message (' + delay.attrs.stamp + '): ' + message);
    } else {
      // normal group chat message
      newMsg = {
        date : new Date(),
        sender : sender,
        msg : message
      };
      // util.log("Recieved group chat message: " + message);
    }

    self._messages.push(newMsg);

    self.emit('message', newMsg, self._messages.length - 1 );
  };
};

// send the message to the groupchat
XmppClient.prototype.send = function(nick, message) {
  var self = this;
  if (!self._hasRoomEntered) {
    util.log("Currently not in room, queuing this message");
    self._sendOnRoomEntered.push({nick:nick, msg: message});
    return;
  }
//  util.log(util.format("Sending for '%s': %s", nick, message));
  self.cl.send(new xmpp.Element('message', {
    to : self._config.xmpp.roomJid,
    type : 'groupchat'
  }).c('body').t(nick+': '+message));
};
