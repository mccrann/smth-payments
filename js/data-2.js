const payments = [
    {
        customer: 'Aoife Murphy',
        email: 'aoife@example.com',
        amount: 24900,
        currency: 'EUR',
        status: 'paid',
        paymentMethod: 'Visa',
        lastFour: '4242',
        createdAt: '2026-07-16T13:32:00',
    },
    {
        customer: 'Sean Lyons',
        email: 'sean@example.com',
        amount: 8950,
        currency: 'EUR',
        status: 'pending',
        paymentMethod: 'Mastercard',
        lastFour: '8821',
        createdAt: '2026-07-16T12:08:00',
    },
    {
        customer: 'Niamh Byrne',
        email: 'niamh@example.com',
        amount: 17500,
        currency: 'EUR',
        status: 'failed',
        paymentMethod: 'Visa',
        lastFour: '1098',
        createdAt: '2026-07-16T10:41:00',
    },
    {
        customer: 'Cian O’Connor',
        email: 'cian@example.com',
        amount: 32000,
        currency: 'EUR',
        status: 'paid',
        paymentMethod: 'Visa',
        lastFour: '7314',
        createdAt: '2026-07-15T15:20:00',
    },
];

function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency,
    }).format(amount / 100);
}

function formatDateTime(dateString) {
    return new Intl.DateTimeFormat('en-IE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
}

function createPaymentRow(payment) {
    return `
        <tr>
            <td>
                <div class="customer-cell">
                    <strong>${payment.customer}</strong>
                    <span>${payment.email}</span>
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

    tableBody.innerHTML = payments
        .map(createPaymentRow)
        .join('');
}

renderRecentPayments();