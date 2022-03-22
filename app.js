var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yamljs = require("yamljs");


var civilizationsRouter = require('./routes/civilizations');
var structuresRouter = require('./routes/structures');
var unitsRouter = require('./routes/units');
var techsRouter = require('./routes/technologies');
const swaggerDocument = yamljs.load('./openapi/v1.yaml');

const appTitle = 'Age of Empires: Definitive Edition API'
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

module.exports = app;