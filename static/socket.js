$(document).ready(function() { 
  var socket = io.connect("http://localhost:8888");

  $("#chatform").submit(function() {
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

  socket.on("newmsg", function(data) {
    $("#messages").append($("<li>").html(data.body));
  });
});