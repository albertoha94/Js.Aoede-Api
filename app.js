var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yamljs = require("yamljs");
const resolveRefs = require("json-refs").resolveRefs;
var http = require('http');
var debug = require('debug')('aoede-net-api:server');

var civilizationsRouter = require('./routes/civilizations');
var structuresRouter = require('./routes/structures');
var unitsRouter = require('./routes/units');
var techsRouter = require('./routes/technologies');

/**
 * Return JSON with resolved references
 * @param {array | object} root - The structure to find JSON References within (Swagger spec)
 * @returns {Promise.<JSON>}
 */
const multiFileSwagger = (root) => {
  const options = {
    filter: ["relative", "remote"],
    loaderOptions: {
      processContent: function (res, callback) {
        callback(null, yamljs.parse(res.text));
      },
    },
  };

  return resolveRefs(root, options).then(
    function (results) {
      return results.resolved;
    },
    function (err) {
      console.log(err.stack);
    }
  );
};

const appTitle = 'Age of Empires: Definitive Edition API'
const app = express();
const createApp = async () => {

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  const swaggerDocument = await multiFileSwagger(
    yamljs.load(path.resolve(__dirname, "./openapi/v1.yaml"))
  );


  app.use('/civilizations', civilizationsRouter);
  app.use('/structures', structuresRouter);
  app.use('/units', unitsRouter);
  app.use('/technologies', techsRouter);
  app.use('/', swaggerUi.serve, swaggerUi.setup(
    swaggerDocument,
    {
      customSiteTitle: appTitle,
      customfavIcon: "./images/favicon/favicon.ico",
      customCss: `.swagger-ui .topbar { display: none }`,
    })
  );
  app.get('*', function (req, res) {
    res.redirect('/');
  });

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  return app;
};

createApp().then(app => {

  /**
   * Normalize a port into a number, string, or false.
   */
  function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }

  // Get port from environment and store in Express.
  var port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  // Create HTTP server.
  var server = http.createServer(app);

  // Listen on provided port, on all network interfaces.
  server.listen(port);
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
  server.on('listening', () => {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  });
});
