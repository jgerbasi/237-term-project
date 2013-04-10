$(document).ready(function() {
  console.log(docCookies.getItem('username'));
  $("#welcome").append(docCookies.getItem('username') + "! Welcome to Horde Slayer");
});