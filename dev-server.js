const express = require('express');
const fs = require('fs');
const path = require('path');

// Manually load .env variables if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

const app = express();
app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// Helper to adapt Vercel handler function signature (req, res) to Express route
const adapt = (handler) => {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('Handler execution error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  };
};

// Import Vercel handlers
const configHandler = require('./api/config');
const createOrderHandler = require('./api/create-order');
const verifyPaymentHandler = require('./api/verify-payment');

// Register routes
app.get('/api/config', adapt(configHandler));
app.post('/api/create-order', adapt(createOrderHandler));
app.post('/api/verify-payment', adapt(verifyPaymentHandler));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`Local test server running at http://localhost:${PORT}`);
  console.log(`To test the Razorpay integration:`);
  console.log(`1. Open http://localhost:${PORT} in your browser`);
  console.log(`2. Start the quiz and fill out the answers`);
  console.log(`3. On the final step, click "Pay Now"`);
  console.log(`4. Complete the checkout using test credentials`);
  console.log(`======================================================\n`);
});
