const express = require('express');
const path = require('path');
const app = express();

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Set the views folder for EJS templates
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for the homepage
app.get('/', (req, res) => {
    // Sample products array
    const products = [
        { name: 'Suitcase', image: '/images/Suitcase.jpg' },
        { name: 'Wallet', image: '/images/Wallet.jpg' },
        { name: 'Travel Bag', image: '/images/travelBag.jpg' },
        { name: 'Backpack', image: '/images/Backpack.png' },
        { name: 'Passport Holder', image: '/images/PassportHolder.png' },
        { name: 'Card Holder', image: '/images/PassportHolder.png' },
        { name: 'Cufflinks', image: '/images/Cufflinks.jpg' },
        { name: 'Laptop Bag', image: '/images/LaptopBag.png' },
        { name: 'Men\'s Wallet', image: '/images/Wallet.jpg' },
        { name: 'Passport Case', image: '/images/PassportHolder.png' },
        { name: 'Men\'s Belt', image: '/images/MensBelt.png' }
    ];

    // Render the index.ejs template and pass data to it
    res.render('index', { title: 'Jafferjees - Explore the World', products });
});

// Start the server on a specific port (e.g., 5000)
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});






