
// import dotenv from 'dotenv';
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db=require('./config/connection')
const expressHbs = require('express-handlebars');
const helpers = require('handlebars-helpers')();
const session=require("express-session");
const bodyParser = require('body-parser');
require = require('esm')(module);

const Cropper = require('cropperjs');


// const Swal = require('sweetalert')



const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const paymentRouter=require('./routes/paymentRoutes')
const cartRouter=require('./routes/cartRoutes')
// const usersRouter = require('./routes/users');

// import createError from 'http-errors';
// import express from 'express';
// import path from 'path';
// import cookieParser from 'cookie-parser';
// import logger from 'morgan';
// import db from './config/connection';
// const db=require('./config/connection')
// import expressHbs from 'express-handlebars';
// import session from 'express-session';

// const indexRouter = require('./routes/index');
// const adminRouter = require('./routes/admin');
// const usersRouter = require('./routes/users');

// import indexRouter from './routes/index';
// import adminRouter from './routes/admin';
// import usersRouter from './routes/users';

const app = express();

app.use(session({ 
  key:'user_sid',
  secret: "thisisthekeyforuser",
  cookie:{maxAge:6000000},
  saveUninitialized: false, 
  resave: false}));




  //HBS Helper functions definitions

  const hbs = expressHbs.create({});
  
  hbs.handlebars.registerHelper('formatDate', function(date) {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
});

hbs.handlebars.registerHelper('incrementedIndex', function(index) {
  return index + 1;
});

hbs.handlebars.registerHelper('multiply', function(a, b) {
  return a * b;
});

hbs.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if (a === b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

hbs.handlebars.registerHelper('subtract', function(a, b) {
  return a - b;
});

hbs.handlebars.registerHelper('firstN', function (array, n, options) {
  let result = '';
  for (var i = 0; i < n && i < array.length; i++) {
    result += options.fn(array[i]);
  }
  return result;
});


hbs.handlebars.registerHelper("formatCurrency", (amount) => {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  });
  return formatter.format(amount);
});

hbs.handlebars.registerHelper('loopTimes', function(n, block) {
  let accum = '';
  for(let i = 0; i < n; ++i)
    accum += block.fn(i);
  return accum;
})



  // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// app.engine('handlebars', hbs.engine);


app.engine(
  "hbs",
  expressHbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    helpers: helpers,   
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// db.connect((err)=>
// {
//  if(err)
//  {
//    console.log(err);
//  }
//  else{
//    console.log("database linked");
//  }
// })

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/admin',adminRouter);
app.use('/cart',cartRouter);
app.use('/payment',paymentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
 if(err){
  // console.log("Route issue");
  // console.log(err);
  res.status(err.status || 500);
  // res.redirect('/');
  res.render('error', {
    message: err.message,
    error: err
  });
 } else{
  next();
 }
});

// logging middleware
app.use((err, req, res, next) => {
  console.error(err);
  next(err);
});

// module.exports = app;
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}!`);
});