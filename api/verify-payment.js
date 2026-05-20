const crypto = require('crypto');

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

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: 'Razorpay secret key not configured on server' });
  }

  // Parse body
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body || {};

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing required signature verification fields' });
  }

  try {
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.status(200).json({ status: 'ok', message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ error: 'Signature verification failed' });
    }
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return res.status(500).json({ error: 'Internal server error during verification', message: error.message });
  }
};
