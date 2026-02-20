/**
 * ADV_PAPAGAYO - User Data Fetching Application
 * Fetches user data from JSONPlaceholder API and displays it
 * Uses async/await with comprehensive error handling
 */

// Wait for the DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ADV_PAPAGAYO Application Started');
    
    // Get references to DOM elements
    const fetchButton = document.getElementById('fetchUsersBtn');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('errorMessage');
    const userContainer = document.getElementById('userContainer');

    // Add click event listener to the fetch button
    fetchButton.addEventListener('click', fetchAndDisplayUsers);

    /**
     * Main function to fetch and display user data
     * Uses async/await for asynchronous operations
     * Implements try-catch-finally for error handling
     */
    async function fetchAndDisplayUsers() {
        // Step 1: Show loading indicator and hide previous results/errors
        showLoading();
        hideError();
        clearContainer();

        try {
            // Step 2: Fetch user data from the API
            console.log('📡 Fetching users from API...');
            const users = await fetchUsers();
            
            // Step 3: Display the fetched users
            console.log(`✅ Successfully fetched ${users.length} users`);
            displayUsers(users);
            
        } catch (error) {
            // Step 4: Handle any errors that occurred
            console.error('❌ Error in fetchAndDisplayUsers:', error);
            handleError(error);
        } finally {
            // Step 5: Hide loading indicator regardless of success or failure
            hideLoading();
        }
    }

    /**
     * Fetches user data from the JSONPlaceholder API
     * @returns {Promise<Array>} Array of user objects
     * @throws {Error} If the network request fails or response is not OK
     */
    async function fetchUsers() {
        // API endpoint URL
        const apiUrl = 'https://jsonplaceholder.typicode.com/users';
        
        try {
            // Make the API request with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(apiUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            // Check if the response is successful
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Parse the JSON response
            const users = await response.json();
            
            // Validate that we received an array
            if (!Array.isArray(users)) {
                throw new Error('Invalid data format: Expected an array of users');
            }
            
            return users;
            
        } catch (error) {
            // Handle specific error types
            if (error.name === 'AbortError') {
                throw new Error('Request timeout: The server took too long to respond');
            } else if (error.name === 'TypeError') {
                throw new Error('Network error: Please check your internet connection');
            } else {
                // Re-throw the error with a user-friendly message
                throw new Error(`Failed to fetch users: ${error.message}`);
            }
        }
    }

    /**
     * Displays user information on the webpage
     * @param {Array} users - Array of user objects to display
     */
    function displayUsers(users) {
        // Clear the container
        userContainer.innerHTML = '';
        
        // Check if there are users to display
        if (!users || users.length === 0) {
            showNoUsersMessage();
            return;
        }
        
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Create a card for each user
        users.forEach(user => {
            const userCard = createUserCard(user);
            fragment.appendChild(userCard);
        });
        
        // Append all cards at once
        userContainer.appendChild(fragment);
        
        console.log(`👥 Displayed ${users.length} users`);
    }

    /**
     * Creates a formatted card element for a single user
     * @param {Object} user - User object containing user details
     * @returns {HTMLElement} Card element with user information
     */
    function createUserCard(user) {
        const card = document.createElement('div');
        card.className = 'user-card';
        
        // Add user ID badge
        const userId = document.createElement('span');
        userId.className = 'user-id';
        userId.textContent = `ID: ${user.id || 'N/A'}`;
        card.appendChild(userId);
        
        // Extract user information with fallbacks for missing data
        const name = user.name || 'Name not available';
        const email = user.email || 'Email not available';
        const city = user.address?.city || 'City not available';
        const username = user.username || 'Username not available';
        
        // Create the card content with icons
        const nameElement = document.createElement('h3');
        nameElement.innerHTML = `👤 ${escapeHTML(name)}`;
        
        const emailElement = document.createElement('p');
        emailElement.innerHTML = `<i>📧</i> Email: ${escapeHTML(email)}`;
        
        const cityElement = document.createElement('p');
        cityElement.innerHTML = `<i>🏙️</i> City: ${escapeHTML(city)}`;
        
        const usernameElement = document.createElement('p');
        usernameElement.innerHTML = `<i>🔰</i> Username: ${escapeHTML(username)}`;
        
        // Append all elements to the card
        card.appendChild(nameElement);
        card.appendChild(emailElement);
        card.appendChild(cityElement);
        card.appendChild(usernameElement);
        
        return card;
    }

    /**
     * Shows loading indicator
     */
    function showLoading() {
        loadingElement.classList.remove('hidden');
    }

    /**
     * Hides loading indicator
     */
    function hideLoading() {
        loadingElement.classList.add('hidden');
    }

    /**
     * Shows error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    /**
     * Hides error message
     */
    function hideError() {
        errorElement.classList.add('hidden');
    }

    /**
     * Clears the user container
     */
    function clearContainer() {
        userContainer.innerHTML = '';
    }

    /**
     * Shows a message when no users are found
     */
    function showNoUsersMessage() {
        userContainer.innerHTML = '<p class="error">No users found to display.</p>';
    }

    /**
     * Handles errors by displaying them to the user
     * @param {Error} error - The error object to handle
     */
    function handleError(error) {
        // Determine user-friendly error message
        let userMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.message.includes('Failed to fetch')) {
            userMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.message.includes('HTTP')) {
            userMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('timeout')) {
            userMessage = 'Request timed out. Please check your connection and try again.';
        }
        
        // Display error message
        showError(`⚠️ ${userMessage}`);
        
        // Log technical details to console
        console.error('Technical details:', error);
    }

    /**
     * Escapes HTML special characters to prevent XSS attacks
     * @param {string} unsafe - The unsafe string to escape
     * @returns {string} Escaped safe string
     */
    function escapeHTML(unsafe) {
        if (!unsafe) return '';
        
        const safe = String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/`/g, '&#96;')
            .replace(/\//g, '&#47;');
        
        return safe;
    }
});