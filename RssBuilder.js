/**
 * Builds and caches an rss feed by messages.
 */
"use strict";

var util = require('util');
var RSS = require("rss");

function RssBuilder(options) {
  options = options || {};

  this.lastBuild = 0;
  this.feedCache = null;

  this.getFeed = function(items) {
    var newestItemDate = 0;
    if (items.length > 0) {
      newestItemDate = items[items.length - 1].date.getTime();
    }
    if (this.lastBuild === null || this.lastBuild <= newestItemDate) {
      this.feedCache = createFeed(options, items);
      this.lastBuild = new Date().getTime();
    }

    return this.feedCache;
  };
}

function createFeed(options, items) {
  util.log("Create new feed");
  var feed = new RSS({
    title: "ips-notes",
    description: "All messages from the jabber group chat 'ips-notes'",
    feed_url: options.feedUrl,
    site_url: options.siteUrl,
    image_url: "",
    author: "xmppMB feed builder"
  });
  
  for (var i=items.length-1; i>=0; i--) {
    var item = items[i];
    feed.item({
      author: item.sender,
      title: "From: " + item.sender,
      description: item.msg,
      date: item.date,
      guid: item.date.getTime()
    });
  }
  
  return feed.xml();
}

module.exports = RssBuilder;
