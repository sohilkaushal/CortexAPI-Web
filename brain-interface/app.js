var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let client = require('socket.io-client');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
let cortex = require('./libs/cortex');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

client = client('http://localhost:9000', { autoConnect: false });
let connection = false;
let openServerSocket = () => {
  connection = true;
  client.open();
};
let closeServerSocket = () =>{
  connection = false;
  client.close();
};

app.get('/start', (req, res, next) => {
  openServerSocket();
  console.log('Open Socket request\n');
  res.send('opening socket');
});

app.get('/stop', (req, res, next) => {
  closeServerSocket();
  console.log('Close Socket Request');
  res.send('closing socket');
});
const streams = ['pow'];
cortex.subscribeStreams(streams);

module.exports = app;
