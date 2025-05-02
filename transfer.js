document.addEventListener('DOMContentLoaded', loadUserAccounts);

async function loadUserAccounts() {
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
        const fromAccountSelect = document.getElementById('fromAccount');
        
        // Clear existing options
        fromAccountSelect.innerHTML = '<option value="">Select Account</option>';
        
        // Add user accounts to dropdown
        accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account._id;
            option.textContent = `${account.accountType} - ${account.accountNumber} (₹${account.balance})`;
            fromAccountSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading accounts:', error);
        alert('Error loading your accounts');
    }
}

document.getElementById('transferForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        fromAccount: document.getElementById('fromAccount').value,
        toAccount: document.getElementById('toAccount').value,
        amount: parseFloat(document.getElementById('amount').value),
        description: document.getElementById('description').value || 'Transfer'
    };

    try {
        const response = await fetch('/api/transactions/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Transfer successful!');
            document.getElementById('transferForm').reset();
            loadUserAccounts(); // Reload accounts to show updated balances
        } else {
            alert(data.error || 'Transfer failed. Please check account details and try again.');
        }
    } catch (error) {
        console.error('Error making transfer:', error);
        alert('Error processing transfer. Please try again.');
    }
});

async function loadRecentTransfers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/transactions/recent', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load recent transfers');
        }

        const transfers = await response.json();
        
        const transfersList = document.querySelector('.transfers-list');
        if (!transfersList) return;

        transfersList.innerHTML = transfers.map(transfer => `
            <div class="transfer-item">
                <div class="transfer-details">
                    <h3>To: ${transfer.toAccount}</h3>
                    <div class="transfer-date">${new Date(transfer.date).toLocaleDateString()}</div>
                    <div>${transfer.description || 'No description'}</div>
                </div>
                <div class="transfer-amount">₹${transfer.amount.toFixed(2)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recent transfers:', error);
        // Don't show alert to user, just log the error
    }
}

// Load recent transfers when page loads
document.addEventListener('DOMContentLoaded', loadRecentTransfers);

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}