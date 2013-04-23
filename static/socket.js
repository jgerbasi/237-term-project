var socket = io.connect("128.237.226.115:8888");
var username = docCookies.getItem('username');

$(document).ready(function() {

  $("#chatform").submit(function() {
      // send the msg event, with some data
      socket.emit('msg', {
                          sender: username,
                          body: " -> " + $("#chatbody").val() 
                          });
      $("#chatbody").val('');
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
  var name = $("<span>").html(data.sender);
  var li = $("<li>");
  li.append(name);
  li.append(data.body);
  $("#messages").append(li);
  $("#messageBox").animate({
        scrollTop: $(document).height() + $("#messages").height(),
    });
});