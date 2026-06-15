// Check credentials before initializing
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!keyId || !keySecret) {
    return res.status(401).json({ error: 'Razorpay keys not configured on server' });
  }

  if (!razorpay) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  // Parse body
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { amount, currency, receipt } = body || {};

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  const amountVal = parseInt(amount, 10);
  if (isNaN(amountVal) || amountVal < 100) {
    return res.status(400).json({ error: 'Minimum amount must be 100 paise' });
  }

  try {
    const options = {
      amount: amountVal,
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ error: 'Failed to create order', message: error.message });
  }
};
