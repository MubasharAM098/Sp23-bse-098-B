const express = require('express');
const router = express.Router();

// Cart storage in session
router.get('/', (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { cart });
});

router.post('/add', (req, res) => {
    const { productId, productName, price } = req.body;
    const cart = req.session.cart || [];
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += 1;
    } else {
        cart.push({ productId, productName, price, quantity: 1 });
    }

    req.session.cart = cart;
    req.flash('success_msg', 'Item added to cart');
    res.redirect('/');
});

module.exports = router;
