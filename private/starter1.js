var thisModule = this;
exports.processRequest = function(request,response) {
  var name = request.data["nm"];
  var city = request.data["ct"];
  var gender = request.data["gender"];

  response.setContentType("text/html");
  response.write("<!DOCTYPE HTML>");
  response.write("<html lang='en'>");
  response.write("<head>");
  response.write("<title>Cool Server Side Processing Example</title>");
  response.write("<meta charset='utf-8'>");
  response.write("</head>");
  response.write("<body>");
  response.write(`<h1>Welcome ${name} (${gender})</h1>`);
  response.write(`<p>${city} is consider as Indis'a cleanest city</p>`);
  response.write("</body>");
  response.write("</html>");
 
}