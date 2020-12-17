const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = Schema(
  {
    full_name: {
      type: String,
      required: [true, 'Nama Harus Diisi'],
      minLength: [3, 'Panjang nama harus diantara 3 - 255 karakter'],
      maxLength: [255, 'Panjang nama harus diantara 3 - 255 karakter']
    },

    customer_id: {
      type: Number
    },

    email: {
      type: String,
      required: [true, 'Email harus diisi'],
      maxLength: [255, 'Panjang email maksimal 255 karakter']
    },

    password: {
      type: String,
      required: [true, 'Password harus diisi'],
      maxLength: [255, 'Panjang password maksimal 255 karakter']
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },

    token: [String]
  },
  { timestamps: true }
);

//! VALIDASI EMAIL DENGAN MONGOOSE CUSTOM VALIDATION
//todo 1. gunakan userSchema lalu tentukan path yg akan divalidasi secara custom _email_
userSchema.path('email').validate(
  //todo 2. berikan fungsi untuk menangkap nilai email yang dimasukan
  function (value) {
    //todo 3. mengecek apakah value merupakan bentuk email yang valid / tidak menggunakan regex seperti ini.
    const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    //todo 4. test email, hasilnya _true_ / _false_
    //* Jika true maka validasi berhasil
    //* Jika false maka validasi gagal
    return EMAIL_RE.test(value);
  },
  //* pesan ini merupakan jika validasi tidak terpenuhi
  (attr) => `${attr.value} harus merupakan email yang valid!`
);

//! VALIDASI EMAIL YANG SUDAH TERDAFTAR
//todo 1. gunakan userSchema lalu tentukan path yg akan divalidasi secara custom _email_
userSchema.path('email').validate(
  //todo 2. gunakan fungsi async untuk oparasi pencarian ke collection User guna pengecekan
  async function (value) {
    try {
      //todo 3. lakukan pencarian ke collection 'User' berdasarkan 'email'
      const count = await this.model('User').count({ email: value });
      //todo 4. kode ini mengindikasikan bahwa jika user ditemukan akan mengembalikan _false_ jika tidak ditemukan maka _true_
      //* Jika true maka validasi berhasil
      //* Jika false maka validasi gagal
      return !count;
    } catch (err) {
      throw err;
    }
  },
  //* pesan ini merupakan jika validasi tidak terpenuhi
  (attr) => `${attr.value} sudah terdaftar`
);

//! HASHING PASSWORD PADA MONGOOSE HOOK
userSchema.pre('save', function (next) {
  const HASH_ROUND = 10;
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

//! AUTO INCREMENT UNTUK "CUSTOMER_ID"
userSchema.plugin(AutoIncrement, { inc_field: 'customer_id' });

module.exports = model('User', userSchema);
