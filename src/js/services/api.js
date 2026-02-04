/**
 * Frappe API Service for Gestion del Tiempo
 * Handles all communication with the Frappe backend
 */

class FrappeAPI {
    constructor(baseUrl = '') {
        // Default to localhost for development, can be configured
        this.baseUrl = baseUrl || localStorage.getItem('frappe_api_url') || 'http://localhost:8080';
        this.sessionToken = null;
    }

    /**
     * Set the base URL for API calls
     * @param {string} url - The base URL of the Frappe instance
     */
    setBaseUrl(url) {
        this.baseUrl = url;
        localStorage.setItem('frappe_api_url', url);
    }

    /**
     * Make an authenticated request to the Frappe API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} - Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        // Add session token if available
        if (this.sessionToken) {
            headers['Authorization'] = `token ${this.sessionToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include' // Include cookies for session-based auth
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            }

            const data = await response.json();
            return data.message || data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== Authentication ====================

    /**
     * Login to Frappe
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Login response
     */
    async login(email, password) {
        const response = await this.request('/api/method/frappe.auth.login', {
            method: 'POST',
            body: JSON.stringify({ usr: email, pwd: password })
        });
        return response;
    }

    /**
     * Logout from Frappe
     * @returns {Promise<Object>} - Logout response
     */
    async logout() {
        const response = await this.request('/api/method/frappe.auth.logout', {
            method: 'POST'
        });
        this.sessionToken = null;
        return response;
    }

    /**
     * Get current logged in user
     * @returns {Promise<Object>} - User data
     */
    async getCurrentUser() {
        return this.request('/api/method/frappe.auth.get_logged_user');
    }

    // ==================== Dashboard Stats ====================

    /**
     * Get dashboard statistics
     * @returns {Promise<Object>} - Dashboard stats
     */
    async getDashboardStats() {
        return this.request('/api/method/gestion_tiempo.api.get_dashboard_stats');
    }

    // ==================== Customers ====================

    /**
     * Get list of customers with pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Paginated customers list
     */
    async getCustomers(params = {}) {
        const { filters, page = 1, pageSize = 20 } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString()
        });

        if (filters) {
            queryParams.append('filters', JSON.stringify(filters));
        }

        return this.request(`/api/method/gestion_tiempo.api.get_customers_list?${queryParams}`);
    }

    /**
     * Get customer details by email
     * @param {string} email - Customer email
     * @returns {Promise<Object>} - Customer details
     */
    async getCustomerDetails(email) {
        return this.request(`/api/method/gestion_tiempo.api.get_customer_details?customer_email=${encodeURIComponent(email)}`);
    }

    /**
     * Create a new customer
     * @param {Object} customerData - Customer data
     * @returns {Promise<Object>} - Created customer
     */
    async createCustomer(customerData) {
        return this.request('/api/resource/Customer', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    }

    /**
     * Update customer
     * @param {string} customerId - Customer ID
     * @param {Object} customerData - Updated data
     * @returns {Promise<Object>} - Updated customer
     */
    async updateCustomer(customerId, customerData) {
        return this.request(`/api/resource/Customer/${customerId}`, {
            method: 'PUT',
            body: JSON.stringify(customerData)
        });
    }

    /**
     * Delete customer
     * @param {string} customerId - Customer ID
     * @returns {Promise<Object>} - Deletion response
     */
    async deleteCustomer(customerId) {
        return this.request(`/api/resource/Customer/${customerId}`, {
            method: 'DELETE'
        });
    }

    // ==================== Subscription Plans ====================

    /**
     * Get all subscription plans
     * @returns {Promise<Array>} - List of plans
     */
    async getSubscriptionPlans() {
        return this.request('/api/method/gestion_tiempo.api.get_subscription_plans');
    }

    // ==================== Subscriptions ====================

    /**
     * Get list of subscriptions with pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Paginated subscriptions list
     */
    async getSubscriptions(params = {}) {
        const { filters, page = 1, pageSize = 20 } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString()
        });

        if (filters) {
            queryParams.append('filters', JSON.stringify(filters));
        }

        return this.request(`/api/method/gestion_tiempo.api.get_subscriptions_list?${queryParams}`);
    }

    /**
     * Create subscription for a customer
     * @param {string} customerId - Customer ID
     * @param {string} planId - Plan ID
     * @param {string} billingCycle - 'Monthly' or 'Yearly'
     * @returns {Promise<Object>} - Created subscription
     */
    async createSubscription(customerId, planId, billingCycle = 'Monthly') {
        return this.request('/api/method/gestion_tiempo.api.create_subscription', {
            method: 'POST',
            body: JSON.stringify({
                customer: customerId,
                plan: planId,
                billing_cycle: billingCycle
            })
        });
    }

    /**
     * Cancel a subscription
     * @param {string} subscriptionId - Subscription ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} - Cancellation response
     */
    async cancelSubscription(subscriptionId, reason = '') {
        return this.request('/api/method/gestion_tiempo.api.cancel_subscription', {
            method: 'POST',
            body: JSON.stringify({
                subscription_id: subscriptionId,
                reason: reason
            })
        });
    }

    /**
     * Upgrade or downgrade subscription plan
     * @param {string} subscriptionId - Subscription ID
     * @param {string} newPlanId - New plan ID
     * @returns {Promise<Object>} - Upgrade response
     */
    async upgradePlan(subscriptionId, newPlanId) {
        return this.request('/api/method/gestion_tiempo.api.upgrade_plan', {
            method: 'POST',
            body: JSON.stringify({
                subscription_id: subscriptionId,
                new_plan: newPlanId
            })
        });
    }

    /**
     * Extend subscription by days
     * @param {string} subscriptionId - Subscription ID
     * @param {number} days - Days to extend
     * @returns {Promise<Object>} - Extension response
     */
    async extendSubscription(subscriptionId, days) {
        return this.request('/api/method/gestion_tiempo.api.extend_subscription', {
            method: 'POST',
            body: JSON.stringify({
                subscription_id: subscriptionId,
                days: days
            })
        });
    }

    /**
     * Check subscription status for a user (public endpoint)
     * @param {string} email - User email
     * @returns {Promise<Object>} - Subscription status
     */
    async checkSubscriptionStatus(email) {
        return this.request(`/api/method/gestion_tiempo.api.check_subscription_status?email=${encodeURIComponent(email)}`);
    }

    // ==================== Payments ====================

    /**
     * Get list of payments with pagination
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Paginated payments list
     */
    async getPayments(params = {}) {
        const { filters, page = 1, pageSize = 20 } = params;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString()
        });

        if (filters) {
            queryParams.append('filters', JSON.stringify(filters));
        }

        return this.request(`/api/method/gestion_tiempo.api.get_payments_list?${queryParams}`);
    }

    /**
     * Process a payment
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>} - Payment response
     */
    async processPayment(paymentData) {
        return this.request('/api/method/gestion_tiempo.api.process_payment', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // ==================== Reports ====================

    /**
     * Export report data
     * @param {string} reportType - Type of report (customers, subscriptions, payments, revenue)
     * @param {string} dateFrom - Start date
     * @param {string} dateTo - End date
     * @returns {Promise<Array>} - Report data
     */
    async exportReport(reportType, dateFrom = null, dateTo = null) {
        const params = new URLSearchParams({ report_type: reportType });

        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        return this.request(`/api/method/gestion_tiempo.api.export_report?${params}`);
    }

    // ==================== Utility Methods ====================

    /**
     * Convert data to CSV and trigger download
     * @param {Array} data - Data array
     * @param {string} filename - File name
     */
    downloadAsCSV(data, filename) {
        if (!data || data.length === 0) {
            console.warn('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if contains comma
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value ?? '';
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Format currency (Chilean Pesos)
     * @param {number} amount - Amount in cents
     * @returns {string} - Formatted currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Format date
     * @param {string} dateStr - Date string
     * @returns {string} - Formatted date
     */
    formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Intl.DateTimeFormat('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateStr));
    }
}

// Create singleton instance
const frappeAPI = new FrappeAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FrappeAPI, frappeAPI };
}

// Also expose globally for inline scripts
window.FrappeAPI = FrappeAPI;
window.frappeAPI = frappeAPI;
