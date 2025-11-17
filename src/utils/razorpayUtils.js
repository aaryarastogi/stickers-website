// Razorpay payment utility functions

let razorpayKeyId = null;

// Initialize Razorpay key from backend
export const initializeRazorpay = async () => {
  try {
    const response = await fetch('/api/payments/key');
    if (response.ok) {
      const data = await response.json();
      razorpayKeyId = data.key_id;
      return razorpayKeyId;
    }
  } catch (error) {
    console.error('Failed to fetch Razorpay key:', error);
  }
  return null;
};

// Create order in backend
export const createPaymentOrder = async (orderData, token) => {
  try {
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

// Verify payment in backend
export const verifyPayment = async (paymentData, token) => {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Open Razorpay checkout
export const openRazorpayCheckout = (order, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!razorpayKeyId) {
      reject(new Error('Razorpay key not initialized'));
      return;
    }

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        proceedWithCheckout(order, options, resolve, reject);
      };
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay script'));
      };
      document.body.appendChild(script);
    } else {
      proceedWithCheckout(order, options, resolve, reject);
    }
  });
};

const proceedWithCheckout = (order, options, resolve, reject) => {
  // Ensure INR currency is used for domestic payments
  // Razorpay requires INR for domestic cards
  const currency = order.currency || 'INR';
  
  // Log for debugging
  console.log('Razorpay Checkout - Currency:', currency);
  console.log('Razorpay Checkout - Amount:', order.amount);
  console.log('Razorpay Checkout - Order ID:', order.razorpay_order_id);
  
  const razorpayOptions = {
    key: razorpayKeyId,
    amount: order.amount, // Amount in smallest currency unit (paise for INR, cents for USD)
    currency: currency, // Ensure currency is set
    name: options.name || 'Stickers Website',
    description: options.description || 'Payment for stickers',
    order_id: order.razorpay_order_id,
    handler: function (response) {
      console.log('Payment successful:', response);
      resolve({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature
      });
    },
    prefill: {
      name: options.customerName || '',
      email: options.customerEmail || '',
      contact: options.customerPhone || ''
    },
    theme: {
      color: '#6366f1' // Purple color matching your theme
    },
    modal: {
      ondismiss: function() {
        reject(new Error('Payment cancelled by user'));
      }
    }
  };

  const razorpay = new window.Razorpay(razorpayOptions);
  
  // Add error event listener
  razorpay.on('payment.failed', function (response) {
    console.error('Payment failed:', response.error);
    reject(new Error(response.error.description || 'Payment failed'));
  });
  
  razorpay.open();
};

// Convert price to smallest currency unit for Razorpay
export const convertToSmallestUnit = (amount, currency) => {
  // All currencies use 100 as the smallest unit multiplier
  // INR: 1 rupee = 100 paise
  // USD, EUR, GBP, etc.: 1 unit = 100 cents
  return Math.round(amount * 100);
};

