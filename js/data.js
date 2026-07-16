const STORAGE_KEY = 'smth-payments-demo-data';

const seedData = {
  customers: [
    {
      id: 'cus_001',
      name: 'Aoife Murphy',
      email: 'aoife@example.com',
      status: 'active',
      createdAt: '2026-06-18T10:30:00.000Z',
    },
    {
      id: 'cus_002',
      name: 'Sean Lyons',
      email: 'sean@example.com',
      status: 'active',
      createdAt: '2026-06-21T14:15:00.000Z',
    },
    {
      id: 'cus_003',
      name: 'Niamh Byrne',
      email: 'niamh@example.com',
      status: 'active',
      createdAt: '2026-06-24T09:45:00.000Z',
    },
    {
      id: 'cus_004',
      name: 'Cian O’Connor',
      email: 'cian@example.com',
      status: 'active',
      createdAt: '2026-07-02T12:20:00.000Z',
    },
    {
      id: 'cus_005',
      name: 'Maeve Kelly',
      email: 'maeve@example.com',
      status: 'archived',
      createdAt: '2026-05-11T08:10:00.000Z',
    },
  ],

  payments: [
    {
      id: 'pay_001',
      customerId: 'cus_001',
      amount: 24900,
      currency: 'EUR',
      status: 'paid',
      paymentMethod: 'Visa',
      lastFour: '4242',
      createdAt: '2026-07-16T13:32:00.000Z',
      refundedAmount: 0,
    },
    {
      id: 'pay_002',
      customerId: 'cus_002',
      amount: 8950,
      currency: 'EUR',
      status: 'pending',
      paymentMethod: 'Mastercard',
      lastFour: '8821',
      createdAt: '2026-07-16T12:08:00.000Z',
      refundedAmount: 0,
    },
    {
      id: 'pay_003',
      customerId: 'cus_003',
      amount: 17500,
      currency: 'EUR',
      status: 'failed',
      paymentMethod: 'Visa',
      lastFour: '1098',
      createdAt: '2026-07-16T10:41:00.000Z',
      refundedAmount: 0,
    },
    {
      id: 'pay_004',
      customerId: 'cus_004',
      amount: 32000,
      currency: 'EUR',
      status: 'paid',
      paymentMethod: 'Visa',
      lastFour: '7314',
      createdAt: '2026-07-15T15:20:00.000Z',
      refundedAmount: 0,
    },
    {
      id: 'pay_005',
      customerId: 'cus_001',
      amount: 128400,
      currency: 'EUR',
      status: 'refunded',
      paymentMethod: 'Mastercard',
      lastFour: '3052',
      createdAt: '2026-07-14T09:12:00.000Z',
      refundedAmount: 128400,
    },
    {
      id: 'pay_006',
      customerId: 'cus_005',
      amount: 56000,
      currency: 'EUR',
      status: 'paid',
      paymentMethod: 'Visa',
      lastFour: '6684',
      createdAt: '2026-07-12T16:48:00.000Z',
      refundedAmount: 0,
    },
  ],

  payouts: [
    {
      id: 'po_001',
      amount: 842050,
      currency: 'EUR',
      status: 'scheduled',
      scheduledFor: '2026-07-16T15:00:00.000Z',
    },
    {
      id: 'po_002',
      amount: 489000,
      currency: 'EUR',
      status: 'estimated',
      scheduledFor: '2026-07-17T09:00:00.000Z',
    },
    {
      id: 'po_003',
      amount: 261040,
      currency: 'EUR',
      status: 'estimated',
      scheduledFor: '2026-07-20T09:00:00.000Z',
    },
  ],

  account: {
    availableBalance: 2431020,
    currency: 'EUR',
  },
};

function cloneSeedData() {
  return JSON.parse(JSON.stringify(seedData));
}

export function getData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    const initialData = cloneSeedData();
    saveData(initialData);
    return initialData;
  }

  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error('Could not read SMTH Payments demo data:', error);

    const initialData = cloneSeedData();
    saveData(initialData);

    return initialData;
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  const initialData = cloneSeedData();
  saveData(initialData);
  return initialData;
}

export function getCustomers() {
  return getData().customers;
}

export function getActiveCustomers() {
  return getCustomers().filter((customer) => customer.status === 'active');
}

export function getCustomerById(customerId) {
  return getCustomers().find((customer) => customer.id === customerId) ?? null;
}

export function getPayments() {
  return getData().payments;
}

export function getPaymentsWithCustomers() {
  const data = getData();

  return data.payments.map((payment) => {
    const customer = data.customers.find(
      (item) => item.id === payment.customerId,
    );

    return {
      ...payment,
      customer: customer ?? {
        id: null,
        name: 'Unknown customer',
        email: '',
      },
    };
  });
}

export function getRecentPayments(limit = 5) {
  return getPaymentsWithCustomers()
    .sort(
      (firstPayment, secondPayment) =>
        new Date(secondPayment.createdAt) -
        new Date(firstPayment.createdAt),
    )
    .slice(0, limit);
}

export function getPayouts() {
  return getData().payouts;
}

export function getDashboardSummary() {
  const data = getData();

  const paidPayments = data.payments.filter(
    (payment) => payment.status === 'paid',
  );

  const refundedAmount = data.payments.reduce(
    (total, payment) => total + (payment.refundedAmount ?? 0),
    0,
  );

  const nextPayout = [...data.payouts]
    .filter((payout) => payout.status === 'scheduled')
    .sort(
      (firstPayout, secondPayout) =>
        new Date(firstPayout.scheduledFor) -
        new Date(secondPayout.scheduledFor),
    )[0];

  return {
    availableBalance: data.account.availableBalance,
    currency: data.account.currency,
    paymentCount: paidPayments.length,
    paymentTotal: paidPayments.reduce(
      (total, payment) => total + payment.amount,
      0,
    ),
    refundedAmount,
    refundCount: data.payments.filter(
      (payment) => payment.refundedAmount > 0,
    ).length,
    nextPayoutAmount: nextPayout?.amount ?? 0,
    nextPayoutDate: nextPayout?.scheduledFor ?? null,
  };
}

export function formatCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateTime(dateString) {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}