document.addEventListener('DOMContentLoaded', loadAccounts);

async function loadAccounts() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/accounts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const accounts = await response.json();
        displayAccounts(accounts);
    } catch (error) {
        console.error('Error loading accounts:', error);
    }
}

function displayAccounts(accounts) {
    const accountsList = document.getElementById('accountsList');
    accountsList.innerHTML = accounts.map(account => `
        <div class="account-card">
            <div class="account-info">
                <h3>${account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account</h3>
                <p class="account-number">Account No: ${account.accountNumber}</p>
                <p class="balance">Balance: ₹${account.balance.toFixed(2)}</p>
                <p class="status">Status: ${account.status}</p>
            </div>
            <div class="account-actions">
                <button onclick="viewTransactions('${account._id}')" class="btn secondary-btn">View Transactions</button>
                ${account.status === 'active' ? `
                    <button onclick="closeAccount('${account._id}')" class="btn danger-btn">Close Account</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Modal functions
function openCreateAccountModal() {
    document.getElementById('createAccountModal').style.display = 'block';
}

function closeCreateAccountModal() {
    document.getElementById('createAccountModal').style.display = 'none';
}

// Create account form submission
document.getElementById('createAccountForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        accountType: document.getElementById('accountType').value,
        initialDeposit: parseFloat(document.getElementById('initialDeposit').value)
    };

    try {
        const response = await fetch('/api/accounts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Account created successfully!');
            closeCreateAccountModal();
            loadAccounts(); // Reload the accounts list
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to create account');
        }
    } catch (error) {
        console.error('Error creating account:', error);
        alert('Error creating account');
    }
});

async function viewTransactions(accountId) {
    window.location.href = `/transactions?account=${accountId}`;
}

async function closeAccount(accountId) {
    if (!confirm('Are you sure you want to close this account?')) {
        return;
    }

    try {
        const response = await fetch(`/api/accounts/${accountId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            alert('Account closed successfully');
            loadAccounts(); // Reload the accounts list
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to close account');
        }
    } catch (error) {
        console.error('Error closing account:', error);
        alert('Error closing account');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('createAccountModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}