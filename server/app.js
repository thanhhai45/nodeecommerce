require('dotenv').config();
const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

// init middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// init db
require('./dbs/init.mongodb');
const { countConnect } = require('./helpers/check.connect');
countConnect()
// init routes

// handling errors

app.get('/', (req, res, next) => {
  const strCompress = "Hello FANANANA";
  return res.status(500).json({
    messages: 'Welcome to NodeJS',
    metadata: strCompress.repeat(10000),
  });
})

module.exports = app;