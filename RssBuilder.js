/**
 * Builds and caches an rss feed by messages.
 */
"use strict";

var util = require('util');
var RSS = require("rss");
var crypto = require('crypto');

function RssBuilder(options, MESSAGES) {
  options = options || {};

  this.lastBuild = 0;
  this.feedCache = null;

  this.getFeed = function(items) {
    var newestItemDate = 0;
    if (items.length > 0) {
      newestItemDate = items[items.length - 1].date.getTime();
    }
    if (this.lastBuild === null || this.lastBuild <= newestItemDate) {
      this.feedCache = createFeed(options, MESSAGES, items);
      this.lastBuild = new Date().getTime();
    }

    return this.feedCache;
  };
}

function createFeed(options, MESSAGES, items) {
  util.log("Create new feed");
  var desc = util.format(MESSAGES['feedDescription'], options.chatRoom) + util.format(' [%s (%s)]', MESSAGES['appName'], MESSAGES['appVersion']);
  var feed = new RSS({
    title : MESSAGES['feedTitle'],
    description : desc,
    feed_url : options.feedUrl,
    site_url : options.siteUrl
  });

  for ( var i = items.length - 1; i >= 0; i--) {
    var item = items[i];
    var shasum = crypto.createHash('sha1');
    var guid = shasum.update(item.msg, 'utf8').digest('hex');
    feed.item({
      author : item.sender,
      title : util.format(MESSAGES['feedItemTitle'], item.sender),
      description : item.msg,
      date : item.date,
      guid : guid
    });
  }

  return feed.xml();
}

module.exports = RssBuilder;
