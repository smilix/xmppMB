/**
 * configuration files
 */
module.exports = {
  siteUrl: "http://yourServer:3000",
  listenOnPort: 3000,
  streamKeepAliveIntervalInSec : 60*1,
  timezoneOffset : -1,
  // pattern explained: http://blog.stevenlevithan.com/archives/date-time-format
  htmlClientDateFormat: 'dd-mm-yyyy HH:MM:ss',
  xmpp : {
    jid : "yourJabberId@server",
    password : "Your Password",
    roomJid : "roomJabberIdk@conference.server",
    roomNick : "yourRoomNick"
  },
  validPoster: {
    '192.168.192.1': 'you',
    '192.168.192.2': 'me'
  }
};
