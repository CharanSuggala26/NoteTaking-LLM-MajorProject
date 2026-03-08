// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const connectDB = require('./config/db');

// dotenv.config();

// connectDB();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/notes', require('./routes/noteRoutes'));
// app.use('/api/chat', require('./routes/chatRoutes'));
// app.use('/api/upload', require('./routes/uploadRoutes'));
// app.use('/api/podcast', require('./routes/podcastRoutes'));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB using env variable
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check endpoint (important for Kubernetes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Routes
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/podcast', require('./routes/podcastRoutes'));

const PORT = process.env.PORT || 5000;

// VERY IMPORTANT: listen on 0.0.0.0
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);