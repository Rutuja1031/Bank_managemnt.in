// Load user profile data
async function loadProfile() {
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const user = await response.json();
        
        // Update profile information
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('memberSince').textContent = new Date(user.createdAt).toLocaleDateString();
        
        // Fill form fields
        document.getElementById('fullName').value = user.name;
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
        document.getElementById('emailNotifications').checked = user.preferences?.emailNotifications || false;
        document.getElementById('smsNotifications').checked = user.preferences?.smsNotifications || false;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Handle personal information update
document.getElementById('personalInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };

    try {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Profile updated successfully!');
            loadProfile();
        } else {
            alert('Failed to update profile');
        }
    } catch (error) {
        alert('Error updating profile');
    }
});

// Handle password change
document.getElementById('securityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }

    try {
        const response = await fetch('/api/users/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (response.ok) {
            alert('Password changed successfully!');
            document.getElementById('securityForm').reset();
        } else {
            alert('Failed to change password');
        }
    } catch (error) {
        alert('Error changing password');
    }
});

// Handle preferences update
document.getElementById('preferencesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const preferences = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        smsNotifications: document.getElementById('smsNotifications').checked
    };

    try {
        const response = await fetch('/api/users/preferences', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(preferences)
        });

        if (response.ok) {
            alert('Preferences updated successfully!');
        } else {
            alert('Failed to update preferences');
        }
    } catch (error) {
        alert('Error updating preferences');
    }
});

// Handle profile picture upload
document.getElementById('avatarInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await fetch('/api/users/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('profilePic').src = data.avatarUrl;
            alert('Profile picture updated successfully!');
        } else {
            alert('Failed to update profile picture');
        }
    } catch (error) {
        alert('Error updating profile picture');
    }
});

// Load profile when page loads
document.addEventListener('DOMContentLoaded', loadProfile);

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}