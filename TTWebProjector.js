const fs = require("fs");
const mime = require("mime-types");
const net = require("net");

const configuration = require("./configuration");
const errors = require("./errors");
const requestParser = require("./requestParser");

var bufferSize = 1024;
var buffer = Buffer.alloc(bufferSize);

var mappings = configuration.getConfiguration();

class Response {

  constructor(socket) {
    this.$$$socket = socket;
    this.responseInitiated = false;
    this.contentType = "text/html";
  }

  setContentType(type) {
    this.contentType = type;
  }

  write(data) {
    if(!this.responseInitiated) {
      this.$$$socket.write("HTTP/1.1 200 OK\n");
      this.$$$socket.write(new Date().toGMTString()+"\n");
      this.$$$socket.write("Server: TTWebProjector\n"); 
      this.$$$socket.write(`Content-Type: ${this.contentType}\n`);
      this.$$$socket.write("Connection: close\n\n");
      this.responseInitiated = true;
    }
    this.$$$socket.write(data);
  }
}

function serverResource(socket, resource) {
  if(!fs.existsSync(resource)) {
    errors.send404(socket, resource);
    return;
  }

  var fileDescriptor = fs.openSync(resource, "r");
  var byteExtracted, data;
  while(true) {
    byteExtracted = fs.readSync(fileDescriptor, buffer, 0, bufferSize);
    if(byteExtracted == 0) {
       fs.closeSync(fileDescriptor);
       break;
    }
    if(byteExtracted < bufferSize) {
      data = buffer.slice(0, byteExtracted);
    }
    else {
      data = buffer;
    }
  }

  var header = "HTTP/1.1 200 OK\n";
  header = header + `Content-Type: ${mime.lookup(resource)}\n`;
  header = header + `Content-Length: ${data.length}\n`;
  header = header + "\n";
  var response = header + data;
  socket.write(response);
}

var httpServer = net.createServer(function(socket) {
  socket.on("data", function(data) {
     var request = requestParser.parseRequest(data,mappings);

     if(request.error != 0) {
       errors.processError(request.error, socket, request.resource);
       return;
     }      

     if(request.isClientSideTechnologyResource) {
        serverResource(socket, request.resource);
     } else {
        const service = require("./private/"+request.resource);
        service.processRequest(request,new Response(socket));
     }
  });

  socket.on("error", function() {
     console.log("some error on client side");
  });

  socket.on("end", function() {
     console.log("connection closed by client");
  });
});

httpServer.listen(8080, "localhost", function() {
   console.log("TTWebProjector is up: port 8080");
})