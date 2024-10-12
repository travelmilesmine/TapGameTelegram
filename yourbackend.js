const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Telegraf } = require('telegraf');
const { body, validationResult } = require('express-validator');
require('dotenv').config(); // Load environment variables

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
    origin: 'https://helloworld.netlify.app', // Replace with your frontend origin
    methods: 'GET,POST,PUT,DELETE,OPTIONS', // Allowed methods
    allowedHeaders: ['Content-Type'], // Allowed headers
    optionsSuccessStatus: 200 // For older browsers
};

app.use(cors(corsOptions)); // Enable CORS with options
app.use(express.json()); // Middleware to parse JSON requests

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('Error connecting to MongoDB:', err));

    const userSchema = new mongoose.Schema({
        userId: { type: String, required: true, unique: true },
            }
        }],
    });
    

// Create the User model
const User = mongoose.model('User', userSchema);

// Telegram bot setup using environment variable
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Bot start command
bot.start((ctx) => {
    ctx.reply('Welcome to game.', {
        parse_mode: 'Markdown'
    });
});

// Simple root route
app.get('/', (req, res) => {
    res.send('Server is running. Webhook is set up!');
});

// API endpoint to earn miles
app.post('/blahblah', [
    body('userId').notEmpty().withMessage('User ID is required'),
], async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body; 

    try {
        // Check if the user exists in the database
        let user = await User.findOne({ userId });

        if (!user) {
            // If user doesn't exist, create a new user
            user = new User({
                userId,
                referralCode: userId // Set referralCode to userId when user is created
            });
            await user.save();
        }

        // Increment miles for tapping
        user.miles += 1; // Update to reflect 1 miles per tap
        await user.save();

        res.send({ message: 'Miles earned successfully' });
    } catch (err) {
        console.error('Error processing earn miles:', err);
        res.status(500).send({ error: 'Failed to earn miles' });
    }
});


// Set webhook for the Telegram bot
bot.launch().then(() => {
    console.log('Telegram bot is running');
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Start the Express server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
