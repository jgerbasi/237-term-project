var socket = io.connect("http://128.237.249.192:8888");
var username = docCookies.getItem('username');

$(document).ready(function() {

  $("#chatform").submit(function() {
      // send the msg event, with some data
      socket.emit('msg', {body: username + ": " + $("#chatbody").val() });
      return false;
  });

  socket.on("status", function(data) {
    if (data.success) {
      console.log("Message successfully sent");
    } else {
      console.log("Message failed to send");
    }
  });
});

socket.on("newmsg", function(data) {
  $("#messages").append($("<li>").html(data.body));
  $("#messageBox").animate({
        scrollTop: $(document).height()
    });
});