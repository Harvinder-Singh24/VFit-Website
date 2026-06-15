const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// Mock api config route
app.get('/api/config', (req, res) => {
  res.json({ keyId: 'rzp_test_mock' });
});

// Mock order creation route
app.post('/api/create-order', (req, res) => {
  res.json({ order_id: 'order_mock_' + Date.now(), amount: 9900, currency: 'INR' });
});

// Mock verify payment route
app.post('/api/verify-payment', (req, res) => {
  res.json({ status: 'ok', message: 'Payment verified successfully' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`VFit website running at http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
