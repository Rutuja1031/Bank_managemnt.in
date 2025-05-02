document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Fetch user accounts
        const accountsResponse = await fetch('/api/accounts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const accounts = await accountsResponse.json();

        // Calculate total balance and update dashboard
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
        const accountCount = accounts.length;

        // Fetch recent transactions
        const transactionsResponse = await fetch('/api/transactions/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const recentTransactions = await transactionsResponse.json();

        // Update dashboard elements
        document.getElementById('totalBalance').textContent = `₹${totalBalance.toFixed(2)}`;
        document.getElementById('accountCount').textContent = accountCount;
        document.getElementById('transactionCount').textContent = recentTransactions.length;

        // Update accounts list
        const accountsList = document.getElementById('accountsList');
        accountsList.innerHTML = accounts.map(account => `
            <div class="account-card">
                <h3>${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account</h3>
                <p>Account No: ${account.accountNumber}</p>
                <p class="balance">Balance: ₹${account.balance.toFixed(2)}</p>
                <p>Status: ${account.status}</p>
            </div>
        `).join('');

        // Update recent transactions
        const transactionsList = document.getElementById('recentTransactions');
        transactionsList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <span class="transaction-type">${transaction.type}</span>
                    <span class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <div class="transaction-amount">₹${transaction.amount.toFixed(2)}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Add event listeners for real-time updates
window.addEventListener('focus', loadDashboardData);

// Refresh dashboard every 30 seconds
setInterval(loadDashboardData, 30000);

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}