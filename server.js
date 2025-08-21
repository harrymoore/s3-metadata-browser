const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const s3Routes = require('./routes/s3');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// Routes
app.use('/api/s3', s3Routes);

// Serve Vue app for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error handler - Full error:', err);
  console.error('Stack trace:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, '::', () => {
  console.log(`Server running on port ${PORT} (IPv4 and IPv6)`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`IPv4: http://localhost:${PORT}`);
  console.log(`IPv6: http://[::1]:${PORT}`);
});