// API Base URL - Replace with your actual API endpoint
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// DOM Elements
const userForm = document.getElementById('user-form');
const userIdInput = document.getElementById('user-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const usersList = document.getElementById('users-list');
const searchInput = document.getElementById('search-input');
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('error-message');
const noUsersElement = document.getElementById('no-users');
const usersTable = document.getElementById('users-table');
const toast = document.getElementById('toast');

// State
let users = [];
let filteredUsers = [];
let isEditing = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchUsers);
userForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', cancelEdit);
searchInput.addEventListener('input', handleSearch);

// CRUD Functions

// Create/Update User
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const userData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
    };
    
    try {
        if (isEditing) {
            // Update existing user
            const userId = userIdInput.value;
            await updateUser(userId, userData);
            showToast('User updated successfully!', 'success');
        } else {
            // Create new user
            await createUser(userData);
            showToast('User added successfully!', 'success');
        }
        
        resetForm();
        await fetchUsers();
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        console.error('Form submission error:', error);
    }
}

// Read Users
async function fetchUsers() {
    toggleLoading(true);
    hideError();
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        users = await response.json();
        filteredUsers = [...users];
        renderUsers();
    } catch (error) {
        showError(`Failed to fetch users: ${error.message}`);
        console.error('Fetch error:', error);
    } finally {
        toggleLoading(false);
    }
}

// Create User
async function createUser(userData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
}

// Update User
async function updateUser(id, userData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
}

// Delete User
async function deleteUser(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return true;
}

// UI Functions

// Render users table
function renderUsers() {
    if (filteredUsers.length === 0) {
        usersTable.classList.add('hidden');
        noUsersElement.classList.remove('hidden');
    } else {
        usersTable.classList.remove('hidden');
        noUsersElement.classList.add('hidden');
        
        usersList.innerHTML = '';
        
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${user.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${user.id}">Delete</button>
                </td>
            `;
            
            usersList.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editUser(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteUser(btn.dataset.id));
        });
    }
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredUsers = [...users];
    } else {
        filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm) ||
            (user.phone && user.phone.toLowerCase().includes(searchTerm))
        );
    }
    
    renderUsers();
}

// Edit user form
function editUser(id) {
    const user = users.find(user => user.id.toString() === id.toString());
    
    if (user) {
        isEditing = true;
        userIdInput.value = user.id;
        nameInput.value = user.name;
        emailInput.value = user.email;
        phoneInput.value = user.phone || '';
        
        submitBtn.textContent = 'Update User';
        cancelBtn.classList.remove('hidden');
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Cancel edit mode
function cancelEdit() {
    resetForm();
}

// Reset form
function resetForm() {
    isEditing = false;
    userForm.reset();
    userIdInput.value = '';
    submitBtn.textContent = 'Add User';
    cancelBtn.classList.add('hidden');
}

// Confirm delete
function confirmDeleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        handleDeleteUser(id);
    }
}

// Handle delete user
async function handleDeleteUser(id) {
    try {
        await deleteUser(id);
        
        // Update local array to reflect changes
        users = users.filter(user => user.id.toString() !== id.toString());
        filteredUsers = filteredUsers.filter(user => user.id.toString() !== id.toString());
        
        renderUsers();
        showToast('User deleted successfully!', 'success');
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        console.error('Delete error:', error);
    }
}

// Helper Functions

// Show toast notification
function showToast(message, type = '') {
    toast.textContent = message;
    toast.className = 'toast show';
    
    if (type) {
        toast.classList.add(type);
    }
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Toggle loading state
function toggleLoading(isLoading) {
    if (isLoading) {
        loadingElement.style.display = 'block';
        usersTable.style.display = 'none';
    } else {
        loadingElement.style.display = 'none';
        usersTable.style.display = 'table';
    }
}

// Show error message
function showError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    usersTable.style.display = 'none';
    noUsersElement.classList.add('hidden');
}

// Hide error message
function hideError() {
    errorMessageElement.style.display = 'none';
}

// Error handling for fetch
function handleFetchError(error) {
    console.error('API Error:', error);
    showToast(`Error: ${error.message}`, 'error');
}
