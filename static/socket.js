var socket = io.connect("128.237.183.181:8888");
var username = docCookies.getItem('username');
// var randomColor = Math.floor(Math.random()*16777215).toString(16);

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
  // console.log(randomColor);
  // name.css("color", "#" + randomColor);
  // console.log(name);
  var li = $("<li>");
  li.append(name);
  li.append(data.body);
  $("#messages").append(li);
  $("#messageBox").animate({
        scrollTop: $(document).height() + $("#messages").height(),
    });
});