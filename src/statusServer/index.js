const http = require('http');
const app = require('express')();
const serveStatic = require('serve-static');
const statusFaker = require('./statusFaker');

function startFakerServer (port) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.get('/status', statusFaker.fakeStatus);
  app.get('/loadCpu/:loadFactor', statusFaker.loadCpu);
  app.get('/exit', statusFaker.exit);
  app.set('port', port);

  return http
    .createServer(app)
    .listen(port, () => {
      console.log('Started http server on port', port);
    });
}

function startStaticServer (port) {
  app.use(serveStatic('./docs', {}));

  return http
    .createServer(app)
    .listen(port, () => {
      console.log('Started http server on port', port);
    });
}

function startServer (port = 8001) {
  startFakerServer(port);
  startStaticServer(8000);
}

module.exports = startServer;
