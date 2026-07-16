import {
  formatCurrency,
  formatDateTime,
  getCustomerById,
  getPayments,
  getPayouts,
  initialiseStore,
  resetDemoData,
} from './store.js';

function createPaymentRow(payment) {
  const customer = getCustomerById(payment.customerId);

  return `
    <tr>
      <td>
        <div class="customer-cell">
          <strong>${customer?.name ?? 'Unknown customer'}</strong>
          <span>${customer?.email ?? ''}</span>
        </div>
      </td>

      <td>${formatDateTime(payment.createdAt)}</td>

      <td>
        <span class="status status-${payment.status}">
          ${payment.status}
        </span>
      </td>

      <td>
        ${payment.paymentMethod} •••• ${payment.lastFour}
      </td>

      <td class="amount">
        ${formatCurrency(payment.amount, payment.currency)}
      </td>
    </tr>
  `;
}

function renderRecentPayments() {
  const tableBody = document.querySelector('#recent-payments-body');

  if (!tableBody) {
    return;
  }

  const payments = getPayments()
    .sort(
      (firstPayment, secondPayment) =>
        new Date(secondPayment.createdAt) -
        new Date(firstPayment.createdAt),
    )
    .slice(0, 5);

  tableBody.innerHTML = payments.map(createPaymentRow).join('');
}
function renderDemoUser() {
  const nameElement = document.querySelector('#demo-user-name');

  if (!nameElement) {
    return;
  }

  const savedName = localStorage.getItem('smth-demo-name');

  nameElement.textContent = savedName || 'there';
}
function renderSummary() {
  const payments = getPayments();
  const payouts = getPayouts();

  const successfulPayments = payments.filter(
    (payment) => payment.status === 'paid',
  );

  const refundedAmount = payments.reduce(
    (total, payment) => total + (payment.refundedAmount ?? 0),
    0,
  );

  const nextPayout = payouts
    .filter((payout) => payout.status === 'scheduled')
    .sort(
      (first, second) =>
        new Date(first.scheduledFor) - new Date(second.scheduledFor),
    )[0];

  const paymentTotal = successfulPayments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  document.querySelector('#payments-total').textContent =
    formatCurrency(paymentTotal);

  document.querySelector('#refunds-total').textContent =
    formatCurrency(refundedAmount);

  document.querySelector('#next-payout-total').textContent =
    formatCurrency(nextPayout?.amount ?? 0);
}

async function startDashboard() {
  await initialiseStore();
  renderDemoUser();

  renderSummary();
  renderRecentPayments();

  const resetButton = document.querySelector('#reset-demo-data');

  resetButton?.addEventListener('click', async () => {
    await resetDemoData();
    renderSummary();
    renderRecentPayments();
  });
}

startDashboard().catch((error) => {
  console.error('Could not start dashboard:', error);
});