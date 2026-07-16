const STORAGE_KEYS = {
  customers: 'smth-customers',
  payments: 'smth-payments',
  payouts: 'smth-payouts',
};

const DATA_FILES = {
  customers: '/data/customers.json',
  payments: '/data/payments.json',
  payouts: '/data/payouts.json',
};

async function loadSeedData(type) {
  const response = await fetch(DATA_FILES[type]);

  if (!response.ok) {
    throw new Error(`Could not load ${type} seed data`);
  }

  return response.json();
}

export async function initialiseStore() {
  const types = Object.keys(STORAGE_KEYS);

  await Promise.all(
    types.map(async (type) => {
      const key = STORAGE_KEYS[type];

      if (!localStorage.getItem(key)) {
        const data = await loadSeedData(type);
        localStorage.setItem(key, JSON.stringify(data));
      }
    }),
  );
}

function read(type) {
  const rawData = localStorage.getItem(STORAGE_KEYS[type]);
  if (!rawData) {
    return [];
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Could not parse ${type}:`, error);
    return [];
  }
}

function write(type, data) {
  localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(data));
}

export function getCustomers() {
  return read('customers');
}

export function saveCustomers(customers) {
  write('customers', customers);
}

export function getPayments() {
  return read('payments');
}

export function savePayments(payments) {
  write('payments', payments);
}

export function getPayouts() {
  return read('payouts');
}

export function savePayouts(payouts) {
  write('payouts', payouts);
}

export function getCustomerById(customerId) {
  return getCustomers().find((customer) => customer.id === customerId) ?? null;
}

export function addCustomer({ name, email }) {
  const customers = getCustomers();

  const customer = {
    id: `cus_${crypto.randomUUID()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  customers.unshift(customer);
  saveCustomers(customers);

  return customer;
}

export function updateCustomer(customerId, updates) {
  const customers = getCustomers();

  const updatedCustomers = customers.map((customer) =>
    customer.id === customerId
      ? {
          ...customer,
          ...updates,
        }
      : customer,
  );

  saveCustomers(updatedCustomers);
}

export function archiveCustomer(customerId) {
  updateCustomer(customerId, {
    status: 'archived',
  });
}

export async function resetDemoData() {
  const types = Object.keys(STORAGE_KEYS);

  await Promise.all(
    types.map(async (type) => {
      const data = await loadSeedData(type);
      write(type, data);
    }),
  );
}

export function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

export function formatDateTime(dateString) {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}
export function getPaymentById(paymentId) {
  return getPayments().find((payment) => payment.id === paymentId) ?? null;
}

export function refundPayment(paymentId) {
  const payments = getPayments();

  const payment = payments.find((item) => item.id === paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'paid') {
    throw new Error('Only paid payments can be refunded');
  }

  if (payment.refundedAmount >= payment.amount) {
    throw new Error('This payment has already been refunded');
  }

  const updatedPayments = payments.map((item) =>
    item.id === paymentId
      ? {
          ...item,
          status: 'refunded',
          refundedAmount: item.amount,
          refundedAt: new Date().toISOString(),
        }
      : item,
  );

  savePayments(updatedPayments);

  return updatedPayments.find((item) => item.id === paymentId);
}