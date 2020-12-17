const mongoose = require('mongoose');
const Invoice = require('./model');
const { policyFor } = require('../policy/index');
const { subject } = require('@casl/ability');

//! MEMBUAT FUNGSI UNTUK MELIHAT DETAIL 1 INVOICE TERKAIT ORDER
async function show(req, res, next) {
  try {
    //todo 1. dapatkan route params `order_id`
    let { order_id } = req.params;

    //todo 2. dapatkan data `Invoice` dari mongoDB berdasarkan `order_id`
    let invoice = await Invoice.findOne({ order: order_id })
      .populate('order')
      .populate('user');

    //todo 3. deklerasikan policy untuk `user`
    let policy = policyFor(req.user);

    //todo 4. buat subjectInvoice
    let subjectInvoice = subject('Invoice', {
      ...invoice,
      user_id: invoice.user._id
    });

    //todo 5. cek policy `read` menggunakan `subjectInvoice`
    if (!policy.can('read', subjectInvoice)) {
      return res.json({
        error: 1,
        message: `Anda tidak memiliki hak akses untuk melihat invoice ini`
      });
    }

    //todo 6. response ke `client`
    return res.json(invoice);
  } catch (err) {
    return res.json({
      error: 1,
      message: `Error when getting invoice`
    });
  }
}

module.exports = {
  show
};
