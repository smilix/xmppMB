var TPL = '<li> <div class="meta"><span class="name">{name}</span> <span class="time">{time}</span></div> <div class="msg">{msg}</div> </li>';
var LINK_DETECTION_REGEX = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+(aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal|lan|[a-z]{2}))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)/gi;

function init() {
  $("#chatList").empty();  
  
  $.getJSON('/allMessages', function(data) {
    for ( var i = 0; i < data.length; i++) {
      addItem(data[i]);
    }
    
    initEventSource();
  }).error(function(e) {
    console.log("error all msg");
  });
}

function initEventSource() {
  var source = new EventSource('/chat-stream');
  var lastkeepalive = +new Date();

  source.addEventListener('open', function(e) {
    // Connection was opened.
    $('#statusLed').addClass('statusOk');
  }, false);

  source.addEventListener('error', function(e) {
    $('#statusLed').removeClass('statusOk');
  }, false);

  source.addEventListener('message', function(event) {
    // source.addEventListener('debug', function(event) {
    var data = jQuery.parseJSON(event.data);
    addItem(data);
  }, false);

  source.addEventListener('keepalive', function(e) {
    lastkeepalive = +new Date();
  }, false);

  // check whether we have seen a keepalive event within the last 70 minutes or are disconnected; reconnect if necessary
  var checkinterval = setInterval(function() {
    if ((new Date() - lastkeepalive > 65 * 60 * 1000) || source.readyState == 2) {
      source.close();
      clearInterval(checkinterval);
      setTimeout(onDomReady, 1000);
    }
  }, 5 * 60 * 1000);
}

function addItem(item) {
  var msg = item.msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  msg = msg.replace(LINK_DETECTION_REGEX, function(item) {
    var url = item;
    if (! /[a-z]+:\/\//.test(item)) {
      url = 'http://' + item;
    }
    return '<a href="' + url + '" target="_blank">'+ item + '</a>';
  });
  
  var html = TPL.replace(/{name}/, item.sender).replace(/{time}/, item.date).replace(/{msg}/, msg);
  $("#chatList").prepend($(html));
}

function sendText() {
  var msg = $('#newMessage').val();
  if (msg.length > 0) {
    $.post('/newMessage', {
      msg : msg
    }, function(data) {
      if (data !== undefined && data.status === 0) {
        hideSendBox();
      } else {
        $('#postMessage .error').html("Error (" + data.status + "): " + data.msg);
      }
    }).error(function(e) {
      $('#postMessage .error').html("Unknown error: " + e);
    });
  }
}

function hideSendBox() {
  $('#postMessage').removeClass("open").addClass("closed");
  $('#newMessage').val('');
  return false;
}

$(function() {
  var show = function() {
    $('#postMessage').addClass("open").removeClass("closed");
    return false;
  };
  $('#postMessage a.anker').click(show);

  $('#postMessage .closeButton').click(hideSendBox);
  $('#sendMessage').click(sendText);
  $('#cancelMessage').click(hideSendBox);
  $('#newMessage').keypress(function(event) {
    if (event.ctrlKey && event.keyCode === 13) {
      // ctrl + ENTER
      sendText();
    } else if (event.keyCode === 27) {
      // ESC
      hideSendBox();
      event.preventDefault();
    }
  });
});

if (typeof (EventSource) === "function") {
  $(init);
} else {
  $.getScript("/js/eventsource.js", function() {
    init();
  });
}