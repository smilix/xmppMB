var util = require('util');
var su = require('./StringUtils.js');

//var date = new Date(Date.parse('2012-03-15T19:05:08Z'));
//console.log(date);
//console.log(Date.parse(date));
//console.log(JSON.stringify(date));

var test = "test";

//console.log(su.isString(test));
//console.log(su.isString(date));
//console.log(su.isEmpty(""));
//console.log(su.isEmpty(" "));
//console.log(su.isEmpty(null));
//console.log(su.isEmpty(undefined));
//console.log(su.isEmpty(3));
//console.log(su.isEmpty("10"));
//console.log(su.substringBefore('ich bin, ein test, blah', ','));

var message = "Dies ist meine https://www.circlelab.de/moin/ homepage oder auch www.circlelab.de/test.html und viel kürzer: circlelab.de !";

var LINK_DETECTION_REGEX = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)/gi;
console.log(message.replace(LINK_DETECTION_REGEX, function(item) {
  return '<a href="' + item + '">'+ item + '</a>';
}));