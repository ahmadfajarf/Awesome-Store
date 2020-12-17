//* Import package Mongoose
const mongoose = require('mongoose');

//* ambil module 'model' & 'Schema' dari package mongoose
const { model, Schema } = mongoose;

const productSchema = Schema(
  {
    // Attribute
    name: {
      type: String,
      // Validasi
      minLength: [3, 'Panjang nama makanan minimal 3 karakter'],
      maxLength: [200, 'Panjang nama makanan maksimal 200 karakter'],
      required: [true, 'Nama Produk harus diisi']
    },

    description: {
      type: String,
      maxLength: [1000, 'Panjang deskripsi maksimal 1000 karakter']
    },

    price: {
      type: Number,
      default: 0
    },

    image_url: String,

    //!------- relation one to one dimongoose antara Product dengan Category ---------//
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },

    //!------ relation one to many dimongoose antara Product dengan Tag --------//
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag'
      }
    ]
  },
  { timestamps: true }
);

module.exports = model('Product', productSchema);
