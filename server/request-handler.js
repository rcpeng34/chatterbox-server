/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

var url = require("url");
var fs = require("fs");
var qs = require("querystring");
// var messages = require("./messages.js");

exports.handler = function(request, response) {
  /*  the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  console.log("Serving request type " + request.method + " for url " + request.url);

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  // define the path that is accepted
  var path = url.parse(request.url).pathname;
// BEGIN IF STATEMENTS RELATING TO CHAT RELATED SERVER REQUESTS //
  if (path === '/classes/messages'){
    if (request.method === 'GET'){
      console.log("GET request received");
      response.writeHead(200, headers);

      fs.readFile('../server/messages.rtf', 'utf8', handleFile);

      //here is the callback on what to do once fs has read all the messages
      var handleFile = function (err, data) {
        if (err) {
          throw err;
        }
        //respond with all messages, but stringified
        // var responsePackage = {results: data};
        var responsePackage = JSON.parse("[" + data + "]");
        responsePackage = JSON.stringify({results: responsePackage});
        response.end(responsePackage);
      };
    }
    //post is used for sending messages to the server
    else if (request.method === 'POST'){
      // for posts, wait until entire message is received,
      // add to the string as packets come in
      var newMessage = '';
      request.on('data', function (data){
        newMessage += data;
      });
      // once complete, begin actual parsing and pushing to messages
      request.on('end', function(){
        newMessage = JSON.parse(newMessage);
        newMessage.createdAt = Date();
        fs.appendFile('./server/messages.rtf', ", " + JSON.stringify(newMessage));
      });
      response.writeHead(201, headers);
      response.end();
    }
    else if (request.method === 'OPTIONS') {
      response.writeHead(200, headers);
      response.end();     //server must send end response back to client when sending an initial OPTIONS request
    }
    else { // if not post or get,
      response.writeHead(400, headers);
      response.end();
    }
  }
// BEGIN CHECKS FOR INITIAL PAGE LOAD REQUESTS I.E. WHEN YOU LOOK FOR INDEX.HTML and all other things //
  else if (path === '/'){   //home path loads up the client html page
    fs.readFile('../client/index.html', function (err, html) {
      if (err) {
        throw err;
      }
      response.writeHeader(200, {"Content-Type": "text/html"});
      response.write(html);
      response.end();
    });
  }
  else if (path === '/bower_components/jquery/dist/jquery.js'){  //responds to jquery file request from the html
    fs.readFile('../client/bower_components/jquery/dist/jquery.js', function (err, js) {
      if (err) {
        throw err;
      }
      console.log('in jquery');
      response.writeHeader(200, {"Content-Type": "text/javascript"});
      response.write(js);
      response.end();
    });
  }
  else if (path === '/bower_components/underscore/underscore.js'){  //responds to underscore file request from the html
    fs.readFile('../client/bower_components/underscore/underscore.js', function (err, js) {
      if (err) {
        throw err;
      }
      response.writeHeader(200, {"Content-Type": "text/javascript"});
      response.write(js);
      response.end();
    });
  }
  else if (path === '/scripts/app.js'){ //responds to app.js file request from the html
    fs.readFile('../client/scripts/app.js', function (err, html) {
      if (err) {
        throw err;
      }
      response.writeHeader(200, {"Content-Type": "text/javascript"});
      response.write(html);
      response.end();
    });
  }
  else if (path === '/scripts/config.js'){  //responds to config.js file request from the html
    fs.readFile('../client/scripts/config.js', function (err, html) {
      if (err) {
        throw err;
      }
      response.writeHeader(200, {"Content-Type": "text/javascript"});
      response.write(html);
      response.end();
    });
  }
  else if (path === '/styles/styles.css'){  //responds to styles.css file request from the html
    fs.readFile('../client/styles/styles.css', function (err, html) {
      if (err) {
        throw err;
      }
      response.writeHeader(200, {"Content-Type": "text/css"});
      response.write(html);
      response.end();
    });
  }
  else { // path was illegal - 404 them!
    response.writeHead(404, headers);
    response.end();
  }
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
