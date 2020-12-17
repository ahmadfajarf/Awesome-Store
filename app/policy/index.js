const { AbilityBuilder, Ability } = require('@casl/ability');

const policies = {
  guest(user, { can }) {
    can('read', 'Product');
  },
  user(user, { can }) {
    //! ORDER
    // Membaca daftar _Order_
    can('view', 'Order');
    // Membuat _Order_
    can('create', 'Order');
    // Membaca _Order_ miliknya
    can('read', 'Order', { user_id: user._id });
    //! USER
    // mengupdate data diri sendiri (User)
    can('update', 'User', { _id: user._id });
    //! CART
    // Membaca 'Cart' Miliknya
    can('read', 'Cart', { user_id: user._id });
    // Mengupdate 'Cart' Miliknya
    can('update', 'Cart', { user_id: user._id });
    //! DELIVERY
    // Melihat daftar 'DeliveryAddress'
    can('view', 'DeliveryAddress');
    // Membuat 'DeliveryAddress'
    can('create', 'DeliveryAddress');
    // Membaca 'DeliveryAddress' Miliknya
    can('read', 'DeliveryAddress', { user_id: user._id });
    // Mengupdate 'DeliveryAddress' Miliknya
    can('update', 'DeliveryAddress', { user_id: user._id });
    // Menghapus 'DeliveryAddress' miliknya
    can('delete', 'DeliveryAddress', { user_id: user._id });
    //! INVOCIE
    // Membaca 'Invoice' Miliknya
    can('read', 'Invoice', { user_id: user._id });
  },
  admin(user, { can }) {
    can('manage', 'all');
  }
};

function policyFor(user) {
  let builder = new AbilityBuilder();

  if (user && typeof policies[user.role] === 'function') {
    policies[user.role](user, builder);
  } else {
    policies['guest'](user, builder);
  }
  return new Ability(builder.rules);
}

module.exports = {
  policyFor
};
