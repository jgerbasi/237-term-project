var socket = io.connect("http://128.237.116.88:8888");

$(document).ready(function() {

  $("#chatform").submit(function() {
    console.log("test");
      // send the msg event, with some data
      socket.emit('msg', {body: $("#chatbody").val() });
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
});