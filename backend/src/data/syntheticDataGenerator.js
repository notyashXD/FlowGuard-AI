const { v4: uuidv4 } = require('uuid');

// 60+ Realistic Indian & global customer names
const customerNames = [
  'Aarav Sharma', 'Priya Patel', 'Rahul Mehta', 'Sneha Reddy', 'Vikram Nair',
  'Ananya Iyer', 'Rohan Gupta', 'Kavya Krishnan', 'Arjun Verma', 'Divya Agarwal',
  'Karthik Subramanian', 'Neha Joshi', 'Siddharth Malhotra', 'Riya Bose', 'Aditya Singh',
  'Shreya Pandey', 'Manish Jain', 'Pooja Deshpande', 'Akash Tiwari', 'Swati Kapoor',
  'Rajesh Kumar', 'Meera Nambiar', 'Varun Saxena', 'Ishita Chatterjee', 'Nikhil Rao',
  'Bhavna Shah', 'Tarun Khanna', 'Ankita Mishra', 'Devendra Pillai', 'Simran Kaur',
  'Harish Balakrishnan', 'Tanvi Srivastava', 'Suresh Murthy', 'Nalini Venkatesh', 'Gaurav Arora',
  'Preeti Mathur', 'Amit Chaudhary', 'Shweta Trivedi', 'Vinod Patil', 'Deepa Nair',
  'Abhishek Sengupta', 'Radhika Menon', 'Pranav Kulkarni', 'Sangeeta Pillai', 'Mayank Goyal',
  'Kiran Bhatt', 'Alok Deshmukh', 'Trisha Banerji', 'Chirag Sethi', 'Lavanya Sundaram',
  'Rajat Singhal', 'Namrata Kaul', 'Mohit Aggarwal', 'Gayatri Shenoy', 'Pankaj Varma',
  'Sunita Chadha', 'Sachin Namboodiri', 'Aditi Mukherjee', 'Vivek Chawla', 'Meenakshi Sundaram'
];

// 60+ Unique B2B Companies (Fintech, SaaS, Logistics, Retail, Cloud, Healthcare)
const companies = [
  'ZetaCloud Systems Pvt Ltd', 'Razorflow Logistics Ltd', 'Kavach AI Technologies',
  'BharatPay Solutions', 'UrbanMatrix Robotics', 'Quantiphi Analytics India',
  'PaySphere Global Pvt Ltd', 'NimbleBox Cloud Labs', 'CognitiveScale India',
  'InfraFleet Mobility Ltd', 'OmniChannel Retail Corp', 'AeroStride Aviation',
  'Synthetix Health Tech', 'InfiGrid Power Systems', 'Prism BioSciences Ltd',
  'Zenith Fintech Labs', 'AgriSense Robotics', 'VyaparConnect Solutions',
  'FinNest Global Services', 'CloudNine Telecom Ltd', 'HyperLogix Supply Chain',
  'Kapture CRM Solutions', 'VividCraft Media Labs', 'InstaDoc Telehealth Pvt Ltd',
  'TerraWatt Green Energy', 'BluePrint Architecture Ltd', 'StellarLogic Software',
  'AlphaCore Capital Advisors', 'OptiRoute Freight Systems', 'NexusPay Technologies',
  'DataMesh Analytics Corp', 'PulseHealth Diagnostics', 'CyberFortress Security',
  'Solaris Renewable Systems', 'LogiTrans Worldwide', 'ApexBio Pharma Labs',
  'FinNova Lending Solutions', 'TradeWind Commodities', 'CoreStack Infrastructure',
  'EdTech Horizons India', 'VectorScale Compute', 'InnoVentures Capital',
  'PrimeWave Communications', 'OmniSecure Identity Labs', 'ZenPay Global Commerce',
  'StrataByte Storage Systems', 'Acuity Research Partners', 'BeaconPoint Advisors',
  'AeroFleet Logistics', 'KiteMetrics Marketing AI', 'TrueNorth Engineering',
  'Equinox Enterprise SaaS', 'MedVantage LifeSciences', 'TransactFlow Networks',
  'Vanguard Security Systems', 'Skyline Cloud Solutions', 'CrestView Hospitality',
  'ProTech Consulting Group', 'Horizon Renewable Energy', 'MatrixGlobal Exports'
];

const declineCodes = [
  { code: 'INSUFFICIENT_FUNDS', description: 'Card declined due to insufficient funds' },
  { code: 'CARD_EXPIRED', description: 'Card has expired' },
  { code: 'BANK_TIMEOUT', description: 'Bank gateway timed out during authorization' },
  { code: 'CVV_MISMATCH', description: 'Security code did not match' },
  { code: 'SUSPECTED_FRAUD', description: 'Transaction flagged as potentially fraudulent' },
  { code: 'VELOCITY_LIMIT', description: 'Daily transaction limit reached on card' },
  { code: 'DO_NOT_HONOUR', description: 'Bank declined without specific reason' },
  { code: 'INVALID_ACCOUNT', description: 'Account details could not be verified' }
];

const cartCategories = [
  'Electronics & Gadgets', 'Fashion & Apparel', 'Home Appliances', 'Executive Courses & EdTech',
  'SaaS Enterprise License', 'Aviation & Travel Booking', 'Healthcare Diagnostic Package', 'B2B Wholesale Supplies'
];

const subscriptionPlans = [
  'Pro Developer Monthly', 'Business Growth Annual', 'Starter API Monthly',
  'Enterprise Scale Quarterly', 'Ultimate Platform Annual'
];

const mandateFailureReasons = [
  'insufficient_balance', 'bank_declined', 'expired_mandate', 'account_frozen', 'technical_error'
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomEmail(name) {
  const parts = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  const domains = ['gmail.com', 'yahoo.co.in', 'outlook.com', 'razorpay-corp.in', 'company.in'];
  return `${parts}${randomBetween(10, 99)}@${randomElement(domains)}`;
}

function randomPhone() {
  const prefixes = ['98', '97', '96', '95', '91', '87', '88', '90', '70', '80'];
  return `+91${randomElement(prefixes)}${randomBetween(10000000, 99999999)}`;
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(randomBetween(0, 23), randomBetween(0, 59));
  return date;
}

// ─── Generator functions with guaranteed unique names ───────────────────────

function generatePaymentDegradation(i, name) {
  const decline = randomElement(declineCodes);
  const isHighValue = i === 0;
  const amount = isHighValue ? randomFloat(55000, 95000) : randomFloat(1200, 45000);
  const attemptCount = randomBetween(1, 4);
  const daysOld = randomBetween(0, 8);

  return {
    transactionId: `TXN-PD-${uuidv4().substring(0, 8).toUpperCase()}`,
    customerName: name,
    customerContact: { email: randomEmail(name), phone: randomPhone() },
    amount,
    currency: 'INR',
    failureType: 'payment_degradation',
    failureTimestamp: daysAgo(daysOld),
    attemptCount,
    metadata: {
      declineCode: decline.code,
      declineDescription: decline.description,
      paymentMethod: randomElement(['credit_card', 'debit_card', 'net_banking', 'upi']),
      cardNetwork: randomElement(['Visa', 'Mastercard', 'RuPay', 'Amex']),
      bankName: randomElement(['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'IndusInd']),
      orderId: `ORD-${randomBetween(100000, 999999)}`,
      productCategory: randomElement(cartCategories)
    }
  };
}

function generateCheckoutAbandonment(i, name) {
  const cartValue = randomFloat(800, 28000);
  const isAmbiguous = i === 0;
  const daysOld = randomBetween(0, 8);

  return {
    transactionId: `TXN-CA-${uuidv4().substring(0, 8).toUpperCase()}`,
    customerName: name,
    customerContact: { email: randomEmail(name), phone: randomPhone() },
    amount: cartValue,
    currency: 'INR',
    failureType: 'checkout_abandonment',
    failureTimestamp: daysAgo(daysOld),
    attemptCount: 1,
    metadata: {
      cartId: `CART-${randomBetween(10000, 99999)}`,
      cartValue,
      itemCount: randomBetween(1, 6),
      abandonmentStage: isAmbiguous
        ? 'unknown'
        : randomElement(['payment_page', 'address_entry', 'otp_verification', 'order_review']),
      category: randomElement(cartCategories),
      sessionDurationMinutes: isAmbiguous ? null : randomBetween(3, 40),
      deviceType: randomElement(['mobile', 'desktop', 'tablet']),
      promoCodeApplied: Math.random() > 0.5,
      previousPurchases: isAmbiguous ? null : randomBetween(0, 10)
    }
  };
}

function generateSubscriptionFailure(i, name) {
  const plan = randomElement(subscriptionPlans);
  const daysOld = randomBetween(0, 8);
  const isOld = i === 0;

  return {
    transactionId: `TXN-SF-${uuidv4().substring(0, 8).toUpperCase()}`,
    customerName: name,
    customerContact: { email: randomEmail(name), phone: randomPhone() },
    amount: randomFloat(499, 14999),
    currency: 'INR',
    failureType: 'subscription_failure',
    failureTimestamp: isOld ? daysAgo(randomBetween(8, 18)) : daysAgo(daysOld),
    attemptCount: randomBetween(1, 3),
    metadata: {
      subscriptionId: `SUB-${randomBetween(10000, 99999)}`,
      planName: plan,
      billingCycle: randomElement(['monthly', 'quarterly', 'annual']),
      failureReason: randomElement(mandateFailureReasons),
      mandateId: `MAND-${randomBetween(100000, 999999)}`,
      daysIntoCurrentCycle: randomBetween(1, 28),
      totalSuccessfulBillings: randomBetween(1, 24)
    }
  };
}

function generateOverdueReceivable(i, company, contactPerson) {
  const invoiceAmount = randomFloat(12000, 92000);
  const daysOverdue = randomBetween(5, 45);
  const daysOld = randomBetween(0, 8);

  return {
    transactionId: `TXN-OR-${uuidv4().substring(0, 8).toUpperCase()}`,
    customerName: company,
    customerContact: { email: randomEmail(contactPerson), phone: randomPhone() },
    amount: invoiceAmount,
    currency: 'INR',
    failureType: 'overdue_receivable',
    failureTimestamp: daysAgo(daysOld + daysOverdue),
    attemptCount: randomBetween(1, 2),
    metadata: {
      invoiceId: `INV-${randomBetween(10000, 99999)}`,
      invoiceDate: daysAgo(daysOld + daysOverdue + randomBetween(2, 14)).toISOString(),
      dueDate: daysAgo(daysOverdue).toISOString(),
      daysOverdue,
      contactPerson,
      contactEmail: randomEmail(contactPerson),
      gstNumber: `GST${randomBetween(10, 99)}${randomElement(['ABCDE', 'PQRST', 'MNOPQ'])}${randomBetween(1000, 9999)}Z`,
      creditTerms: randomElement(['NET-30', 'NET-45', 'NET-60']),
      remindersSent: randomBetween(0, 3)
    }
  };
}

// ─── Main Generator (Guarantees zero name collisions) ────────────────────────

function generateSyntheticTransactions() {
  const transactions = [];

  // Shuffle master arrays to pick strictly unique names
  const shuffledNames = [...customerNames].sort(() => Math.random() - 0.5);
  const shuffledCompanies = [...companies].sort(() => Math.random() - 0.5);

  let nameIndex = 0;
  let companyIndex = 0;

  const counts = { pd: 14, ca: 14, sf: 13, or: 13 };

  // 1. Payment Degradations (B2C Customers)
  for (let i = 0; i < counts.pd; i++) {
    const name = shuffledNames[nameIndex++] || `Customer ${i + 1}`;
    transactions.push(generatePaymentDegradation(i, name));
  }

  // 2. Checkout Abandonment (B2C Customers)
  for (let i = 0; i < counts.ca; i++) {
    const name = shuffledNames[nameIndex++] || `Customer ${i + 15}`;
    transactions.push(generateCheckoutAbandonment(i, name));
  }

  // 3. Subscription Failures (B2C & Prosumer Customers)
  for (let i = 0; i < counts.sf; i++) {
    const name = shuffledNames[nameIndex++] || `Customer ${i + 30}`;
    transactions.push(generateSubscriptionFailure(i, name));
  }

  // 4. Overdue Receivables (Strictly Unique B2B Corporate Accounts)
  for (let i = 0; i < counts.or; i++) {
    const company = shuffledCompanies[companyIndex++] || `Enterprise ${i + 1} Pvt Ltd`;
    const contact = shuffledNames[nameIndex++] || `Accounts Manager ${i + 1}`;
    transactions.push(generateOverdueReceivable(i, company, contact));
  }

  // Shuffle so categories are cleanly intermixed
  for (let i = transactions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [transactions[i], transactions[j]] = [transactions[j], transactions[i]];
  }

  return transactions;
}

module.exports = { generateSyntheticTransactions };
