const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Order = require('./models/Order');

// App Initialization
const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/jafferjees', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session & Flash Messages
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Passport.js Initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'No user found with this email' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));

// Middleware for Authentication
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/auth/login');
};

// Routes

// Home Route
app.get('/', (req, res) => {
    const products = [
        { name: 'Suitcase', image: '/images/Suitcase.jpg', alt: 'Suitcase' },
        { name: 'Wallet', image: '/images/Wallet.jpg', alt: 'Wallet' },
        { name: 'Travel Bag', image: '/images/travelBag.jpg', alt: 'Travel Bag' },
    ];
    res.render('index', { title: 'Jafferjees - Explore the World', products });
});

// Authentication Routes
app.get('/auth/register', (req, res) => res.render('register'));
app.post('/auth/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    if (!name || !email || !password || !password2) errors.push({ msg: 'Please fill in all fields' });
    if (password !== password2) errors.push({ msg: 'Passwords do not match' });
    if (password.length < 6) errors.push({ msg: 'Password should be at least 6 characters' });

    if (errors.length > 0) {
        return res.render('register', { errors, name, email, password, password2 });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            errors.push({ msg: 'Email is already registered' });
            return res.render('register', { errors, name, email, password, password2 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
    }
});

app.get('/auth/login', (req, res) => res.render('login'));
app.post('/auth/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
}));
app.get('/auth/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
});

// Cart Routes
app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    res.render('cart', { cart });
});
app.post('/cart/add', (req, res) => {
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

// Order Routes
app.get('/orders', ensureAuthenticated, async (req, res) => {
    const orders = await Order.find({ userId: req.user._id });
    res.render('orders', { orders });
});
app.post('/orders/place', ensureAuthenticated, async (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
        req.flash('error_msg', 'Cart is empty');
        return res.redirect('/cart');
    }

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = new Order({
        userId: req.user._id,
        items: cart,
        totalPrice,
    });

    await newOrder.save();
    req.session.cart = [];
    req.flash('success_msg', 'Order placed successfully');
    res.redirect('/orders');
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
