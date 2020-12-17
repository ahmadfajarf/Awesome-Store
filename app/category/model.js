const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const categorySchema = {
  name: {
    type: String,
    minLength: [3, 'Panjang nama category minimal 3 karakter'],
    maxLength: [20, 'Panjang nama category maksimal 20 karakter'],
    required: [true, 'Nama category harus diisi']
  }
};

module.exports = model('Category', categorySchema);
