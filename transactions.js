let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
    loadUserAccounts();
});

async function loadTransactions() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/transactions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        displayTransactions(data);
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

function displayTransactions(transactions) {
    const transactionsList = document.querySelector('.transactions-list');
    if (!transactions || transactions.length === 0) {
        transactionsList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center;">No transactions found</td>
            </tr>`;
        return;
    }

    transactionsList.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${new Date(transaction.date).toLocaleString()}</td>
            <td><span class="badge ${transaction.type}">${transaction.type}</span></td>
            <td>${transaction.fromAccount}</td>
            <td>${transaction.toAccount}</td>
            <td>${transaction.description || 'No description'}</td>
            <td class="amount">₹${parseFloat(transaction.amount).toFixed(2)}</td>
        </tr>
    `).join('');
}

async function loadUserAccounts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/accounts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const accounts = await response.json();
        const accountFilter = document.getElementById('accountFilter');
        
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account._id;
            option.textContent = `${account.accountType} - ${account.accountNumber}`;
            accountFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}

// Add event listeners for filters
document.getElementById('accountFilter').addEventListener('change', loadTransactions);
document.getElementById('typeFilter').addEventListener('change', loadTransactions);
document.getElementById('dateFilter').addEventListener('change', loadTransactions);

function applyFilters() {
    currentPage = 1;
    loadTransactions();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadTransactions();
    }
}

function nextPage() {
    currentPage++;
    loadTransactions();
}

// Load transactions when page loads
document.addEventListener('DOMContentLoaded', loadTransactions);

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}