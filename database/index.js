//* Import package Mongoose
const mongoose = require('mongoose');

//* Import Configuration terkait MongoDB dari './app/config.js'
const { dbHost, dbPort, dbUser, dbPass, dbName } = require('../app/config');

//* Connect Ke MongoDB menggunakan Configuration yang telah di import
mongoose.connect(
  `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

//* Simpan koneksi ke dalam constan 'db'
const db = mongoose.connection;

//* export 'db' supaya bisa digunakan di file lain yang dibutuhkan
module.exports = db;
