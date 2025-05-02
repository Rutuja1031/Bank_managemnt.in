const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/userRoutes');
const accountRoutes = require('./src/routes/accountRoutes');
// Add this with your other route imports
const transactionRoutes = require('./src/routes/transactionRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Update static file serving
app.use(express.static('public'));
app.use(express.static('views'));

// Add this line to properly serve JavaScript files
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);

// Add this with your other route declarations
app.use('/api/transactions', transactionRoutes);

// Add these route handlers before your API routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/accounts', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'accounts.html'));
});

app.get('/transfer', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'transfer.html'));
});

app.get('/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'transactions.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`\nAccess your application at:`);
    console.log(`➜ Local:   http://localhost:${PORT}`);
    console.log(`➜ Network: http://${getLocalIP()}:${PORT}\n`);
});

function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}