var util = require('util');

var RSS = require("rss");

var feed = new RSS({
  title: "Tim Branyen @tbranyen",
  description: "JavaScript and web technology updates.",
  feed_url: "http://tbranyen.com/rss.xml",
  site_url: "http://tbranyen.com",
  image_url: "",
  author: "Tim Branyen @tbranyen"
});

feed.item({
  title: "ein titel",
  description: "eine beschr",
  date: new Date()
//  url: "http://tbranyen.com/post/1"
});

feed.item({
  title: "ein titel 3",
  description: "eine beschr",
  date: new Date()
//  url: "http://tbranyen.com/post/3"
});

feed.item({
  title: "ein titel 2",
  description: "eine beschr",
  date: new Date()
//  url: "http://tbranyen.com/post/2"
});

//console.log(feed.xml());

var a = [];
a.push("1");
a.push("2");
a.push("3");

for (var i=a.length-1; i>=0; i--) {
  console.log(i);
}
