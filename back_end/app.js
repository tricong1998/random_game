var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gameRouter = require('./routes/game');
var playerRouter = require('./routes/player');
var listRouter = require('./routes/list');
const testRouter = require('./routes/test');
var session = require('express-session');
const auth = require('./service/auth');
const jwt = require('jsonwebtoken'); //we're using 'express-session' as 'session' here
const cors = require('cors');
const io = require('socket.io')()

var app = express();

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200
}))

app.io = io;
app.io.on('connection', function(socket){  
  console.log(`there is one connection`)
  socket.on('disconnect', () => {
    console.log(`there is one disconnection`)
  })}
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(session({
//   resave: false, // don't save session if unmodified
//   saveUninitialized: false, // don't create session until something stored
//   secret: 'shhhh, very secret'
// }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/list', listRouter);
app.use('/game', auth.requiresLogin, gameRouter(app.io));
app.use('/player', playerRouter(app.io));
app.use('/test', testRouter);

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

module.exports = app;
