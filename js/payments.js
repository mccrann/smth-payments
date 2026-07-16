import {
  formatCurrency,
  formatDateTime,
  getCustomerById,
  getPayments,
  initialiseStore,
  refundPayment,
  resetDemoData
} from './store.js';

const paymentsBody = document.querySelector('#payments-body');
const message = document.querySelector('#payments-message');
const resetDemoDataButton = document.querySelector('#reset-demo-data');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showMessage(text, type = 'success') {
  if (!message) {
    return;
  }

  message.textContent = text;
  message.className = `page-message page-message-${type}`;
  message.hidden = false;

  window.setTimeout(() => {
    message.hidden = true;
  }, 3000);
}

function createPaymentRow(payment) {
  const customer = getCustomerById(payment.customerId);

  const canRefund = payment.status === 'paid';

  return `
    <tr>
      <td>
        <div class="customer-cell">
          <strong>
            ${escapeHtml(customer?.name ?? 'Unknown customer')}
          </strong>

          <span>
            ${escapeHtml(customer?.email ?? '')}
          </span>
        </div>
      </td>

      <td>
        ${formatDateTime(payment.createdAt)}
      </td>

      <td>
        <span class="status status-${payment.status}">
          ${escapeHtml(payment.status)}
        </span>
      </td>

      <td>
        ${escapeHtml(payment.paymentMethod)}
        ••••
        ${escapeHtml(payment.lastFour)}
      </td>

      <td class="amount">
        ${formatCurrency(payment.amount, payment.currency)}
      </td>

      <td class="payment-actions">
        ${
          canRefund
            ? `
              <button
                class="button button-small refund-payment"
                type="button"
                data-payment-id="${payment.id}"
                data-payment-amount="${formatCurrency(
                  payment.amount,
                  payment.currency,
                )}"
              >
                Refund
              </button>
            `
            : '—'
        }
      </td>
    </tr>
  `;
}
function renderSummary() {
  const payments = getPayments();
  const successfulPayments = payments.filter(
    (payment) => payment.status === 'paid',
  );
  const refundedPayments = payments.filter(
    (payment) => payment.status === 'refunded',
  );
  const failedPayments = payments.filter(
    (payment) => payment.status === 'failed',
  );
  const pendingPayments = payments.filter(
    (payment) => payment.status === 'pending',
  );

  const refundedAmount = payments.reduce(
    (total, payment) => total + (payment.refundedAmount ?? 0),
    0,
  );

  document.querySelector('#total-payments').textContent =
    successfulPayments.length;
  document.querySelector('#total-revenue').textContent = formatCurrency(
    successfulPayments.reduce((total, payment) => total + payment.amount, 0),
  );
    document.querySelector('#total-refunds').textContent = formatCurrency(
      refundedAmount,
    );
  document.querySelector('#total-refunds-number').textContent = refundedPayments.length;
  document.querySelector('#total-pending').textContent = formatCurrency(
    pendingPayments.reduce((total, payment) => total + payment.amount, 0),
  );
  document.querySelector('#total-pending-number').textContent = pendingPayments.length;
  document.querySelector('#total-failed').textContent = formatCurrency(
    failedPayments.reduce((total, payment) => total + payment.amount, 0),
  );
  document.querySelector('#total-failed-number').textContent = failedPayments.length;
}

function renderPayments() {
  const payments = [...getPayments()].sort(
    (firstPayment, secondPayment) =>
      new Date(secondPayment.createdAt) -
      new Date(firstPayment.createdAt),
  );

  paymentsBody.innerHTML = payments.map(createPaymentRow).join('');

  document.querySelectorAll('.refund-payment').forEach((button) => {
    button.addEventListener('click', () => {
      const paymentId = button.dataset.paymentId;
      const amount = button.dataset.paymentAmount;

      const confirmed = window.confirm(
        `Refund the full payment of ${amount}?`,
      );

      if (!confirmed) {
        return;
      }

      try {
        refundPayment(paymentId);
        renderSummary();
        renderPayments();
        showMessage(`${amount} was refunded.`);
      } catch (error) {
        console.error('Could not refund payment:', error);
        showMessage(error.message, 'error');
      }
    });
  });
}

async function startPaymentsPage() {
  await initialiseStore();
  renderSummary();
  renderPayments();
}
resetDemoDataButton.addEventListener('click', async () => {
  await resetDemoData();
  renderSummary();
  renderPayments();
});
startPaymentsPage().catch((error) => {
  console.error('Could not start payments page:', error);
  showMessage('Payments could not be loaded.', 'error');
});