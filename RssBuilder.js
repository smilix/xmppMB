/**
 * Builds and caches an rss feed by messages.
 */
"use strict";

var util = require('util');
var RSS = require("rss");

var MAX_PREVIEW_IN_TITLE = 30;

function RssBuilder(options, MESSAGES) {
  options = options || {};

  this.lastBuild = -1;
  this.feedCache = null;

  this.getFeed = function(items) {
    var newestItemDate = 0;
    if (items.length > 0) {
      newestItemDate = items[items.length - 1].date.getTime();
    }
    if (this.lastBuild === null || this.lastBuild < newestItemDate) {
      this.feedCache = createFeed(options, MESSAGES, items);
      this.lastBuild = newestItemDate;
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
    
    var description = item.msg + ' [' + item.sender + ']'; 
    
    var title = description;
    if (title.length > MAX_PREVIEW_IN_TITLE - 3) {
      title = title.substring(0, MAX_PREVIEW_IN_TITLE - 3) + '...';
    }
    feed.item({
      author : item.sender,
      title : title,
      description : description,
      date : item.date,
      guid : item.id,
      url: options.siteUrl + '#' + item.id
    });
  }

  return feed.xml();
}

module.exports = RssBuilder;
