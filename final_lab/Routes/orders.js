const express = require('express');
const Order = require('../models/Order');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');

// View Orders
router.get('/', ensureAuthenticated, async (req, res) => {
    const orders = await Order.find({ userId: req.user._id });
    res.render('orders', { orders });
});

// Place Order
router.post('/place', ensureAuthenticated, async (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
        req.flash('error_msg', 'Cart is empty');
        return res.redirect('/cart');
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = new Order({
        userId: req.user._id,
        items: cart,
        totalPrice
    });

    await newOrder.save();
    req.session.cart = [];
    req.flash('success_msg', 'Order placed successfully');
    res.redirect('/orders');
});

module.exports = router;
