import {
  addCustomer,
  archiveCustomer,
  formatDateTime,
  getCustomers,
  initialiseStore,
  resetDemoData,
} from './store.js';

const form = document.querySelector('#customer-form');
const openFormButton = document.querySelector('#open-customer-form');
const cancelFormButton = document.querySelector('#cancel-customer-form');
const customersBody = document.querySelector('#customers-body');
const resetDemoDataButton = document.querySelector('#reset-demo-data');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function createCustomerRow(customer) {
  return `
    <tr>
      <td>
        <div class="customer-cell">
          <strong>${escapeHtml(customer.name)}</strong>
          <span>${escapeHtml(customer.email)}</span>
        </div>
      </td>

      <td>
        <span class="status status-${customer.status}">
          ${customer.status}
        </span>
      </td>

      <td>${formatDateTime(customer.createdAt)}</td>

      <td>
        ${
          customer.status === 'active'
            ? `
              <button
                class="button button-small archive-customer"
                type="button"
                data-customer-id="${customer.id}"
              >
                Archive
              </button>
            `
            : ''
        }
      </td>
    </tr>
  `;
}

function renderCustomers() {
  const customers = getCustomers();

  customersBody.innerHTML = customers.map(createCustomerRow).join('');

  document.querySelectorAll('.archive-customer').forEach((button) => {
    button.addEventListener('click', () => {
      archiveCustomer(button.dataset.customerId);
      renderCustomers();
    });
  });
}

function openForm() {
  form.hidden = false;
  document.querySelector('#customer-name').focus();
}

function closeForm() {
  form.hidden = true;
  form.reset();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  addCustomer({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  closeForm();
  renderCustomers();
});

openFormButton.addEventListener('click', openForm);
cancelFormButton.addEventListener('click', closeForm);
resetDemoDataButton.addEventListener('click', async () => {
  await resetDemoData();
  renderCustomers();
});
async function startCustomersPage() {
  await initialiseStore();
  renderCustomers();
}

startCustomersPage().catch((error) => {
  console.error('Could not start customers page:', error);
});