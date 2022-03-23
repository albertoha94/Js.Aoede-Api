const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const yamljs = require("yamljs");

const civilizationsRouter = require('./routes/civilizations');
const structuresRouter = require('./routes/structures');
const unitsRouter = require('./routes/units');
const techsRouter = require('./routes/technologies');
const swaggerDocument = yamljs.load(path.resolve(__dirname, "./openapi/v1.yaml"));
const appTitle = 'Age of Empires: Definitive Edition API'
const app = express();

app.use(cors());
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