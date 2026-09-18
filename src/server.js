const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;


const parseBody = (req, res, handler) => {
  let body = [];

  req.on('error', (err) => {
    console.dir(err); // eslint-disable-line no-console
    res.statusCode = 400
    res.end();
  });

  req.on('data', (chunk) => {
    body.push(chunk);
  });

  req.on('end', () => {
    const bodyStr = Buffer.concat(body).toString();
    switch (req.headers['content-type']) {
      case 'application/x-www-form-urlencoded':
        req.body = query.parse(bodyStr);
        break;
      case 'application/json':
        req.body = JSON.parse(bodyStr);
        break;
      default:
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ message: "Invalid data type recieved" }));
        res.end();
    }
    handler(req, res);
  });
}

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addUser') {
    parseBody(request, response, jsonHandler.addUser);
  }
};

const handleGet = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getUsers') {
    jsonHandler.getUsers(request, response);
  } else {
    htmlHandler.getIndex(request, response);
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  }
  else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`); // eslint-disable-line no-console
});
