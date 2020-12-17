var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const productRouter = require('./app/product/router'); //* Import product router
const categoryRouter = require('./app/category/router'); //* Import category router
const tagRouter = require('./app/tag/router'); //* Import tag router
const authRouter = require('./app/auth/router'); //* Import auth router
const { decodeToken } = require('./app/auth/middleware'); //* import middleware decodeToken
const wilayahRouter = require('./app/wilayah/router'); //* import router wilayah
const deliveryAddressRouter = require('./app/delivery-address/router'); //* import router untuk delivery address
const cartRouter = require('./app/cart/router'); //* import router untuk cart / keranjang belanja
const orderRouter = require('./app/order/router'); //* import router untuk order / pesanan
const invoiceRouter = require('./app/invoice/router'); //* import router untuk invoice
const cors = require('cors'); //* import cors

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//* Gunakan CORS
app.use(cors());
//* Gunakan product router yang diimport
app.use('/api', productRouter);
//* Gunakan category router yang diimport
app.use('/api', categoryRouter);
//* Gunakan tag router yang diimport
app.use('/api', tagRouter);
//* Gunakan auth router yang diimport
app.use('/auth', authRouter);
//* Gunakan middleware decodeToken
app.use(decodeToken());
//* Gunakan router wilayah
app.use('/api', wilayahRouter);
//* Gunakan router delivery address
app.use('/api', deliveryAddressRouter);
//* Gunakan router untuk cart
app.use('/api', cartRouter);
//* Gunakan router untuk order / pesanan
app.use('/api', orderRouter);
//* Gunakan router untuk invoice
app.use('/api', invoiceRouter);

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
