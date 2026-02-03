/**
 * Supabase API Service for Gestion del Tiempo
 * Handles all communication with Supabase backend
 */

class SupabaseAPI {
    constructor() {
        this.supabaseUrl = localStorage.getItem('supabase_url') || 'https://crpotifjwqoljvcvsdje.supabase.co';
        this.supabaseKey = localStorage.getItem('supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycG90aWZqd3FvbGp2Y3ZzZGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODI2NzAsImV4cCI6MjA4NTY1ODY3MH0.T33BIMza0J7AZA2juSEBA7GZOcw8RG6ePMzdRVjdnGg';
        this.isConnected = false;
    }

    /**
     * Configure Supabase credentials
     */
    configure(url, key) {
        this.supabaseUrl = url;
        this.supabaseKey = key;
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_key', key);
    }

    /**
     * Make a request to Supabase REST API
     */
    async request(table, options = {}) {
        const { method = 'GET', filters = [], select = '*', body = null, single = false, order = null, limit = null, offset = null } = options;

        let url = `${this.supabaseUrl}/rest/v1/${table}?select=${select}`;

        // Add filters
        filters.forEach(([column, operator, value]) => {
            url += `&${column}=${operator}.${encodeURIComponent(value)}`;
        });

        // Add ordering
        if (order) {
            url += `&order=${order}`;
        }

        // Add pagination
        if (limit) {
            url += `&limit=${limit}`;
        }
        if (offset) {
            url += `&offset=${offset}`;
        }

        const headers = {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': single ? 'return=representation' : 'return=representation'
        };

        if (single && method === 'GET') {
            headers['Accept'] = 'application/vnd.pgrst.object+json';
        }

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            // For DELETE, might not return content
            if (response.status === 204) {
                return { success: true };
            }

            const data = await response.json();
            this.isConnected = true;
            return data;
        } catch (error) {
            console.error('Supabase API Error:', error);
            this.isConnected = false;
            throw error;
        }
    }

    /**
     * Test connection to Supabase
     */
    async testConnection() {
        try {
            await this.request('subscription_plans', { limit: 1 });
            this.isConnected = true;
            return true;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }

    // ==================== Dashboard Stats ====================

    async getDashboardStats() {
        try {
            // Get all data in parallel
            const [customers, subscriptions, payments, plans] = await Promise.all([
                this.request('customers'),
                this.request('subscriptions'),
                this.request('payments'),
                this.request('subscription_plans')
            ]);

            // Calculate stats
            const activeSubscriptions = subscriptions.filter(s => s.status === 'Active');
            const totalCustomers = customers.length;
            const activeCustomers = activeSubscriptions.length;

            // MRR calculation
            let mrr = 0;
            activeSubscriptions.forEach(sub => {
                const plan = plans.find(p => p.id === sub.plan_id);
                if (plan) {
                    if (sub.billing_cycle === 'Monthly') {
                        mrr += plan.price_monthly;
                    } else {
                        mrr += Math.round(plan.price_yearly / 12);
                    }
                }
            });

            // New customers this month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const newThisMonth = customers.filter(c => new Date(c.created_at) >= startOfMonth).length;

            // Cancelled this month (churn)
            const cancelledThisMonth = subscriptions.filter(s =>
                s.status === 'Cancelled' &&
                s.cancellation_date &&
                new Date(s.cancellation_date) >= startOfMonth
            ).length;

            // Churn rate
            const churnRate = activeCustomers > 0 ? ((cancelledThisMonth / activeCustomers) * 100).toFixed(1) : 0;

            // Revenue by month (last 6 months)
            const revenueByMonth = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                const monthPayments = payments.filter(p => {
                    const paymentDate = new Date(p.payment_date);
                    return paymentDate >= date && paymentDate <= monthEnd && p.status === 'Completed';
                });
                const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);
                revenueByMonth.push({
                    month: date.toLocaleDateString('es-CL', { month: 'short' }),
                    total
                });
            }

            // Customers by plan
            const customersByPlan = {};
            plans.forEach(plan => {
                const count = activeSubscriptions.filter(s => s.plan_id === plan.id).length;
                customersByPlan[plan.plan_name] = count;
            });

            // Format revenue trend for charts
            const revenueTrend = revenueByMonth.map(r => ({
                month: r.month,
                revenue: r.total
            }));

            return {
                mrr,
                total_customers: totalCustomers,
                active_customers: activeCustomers,
                active_subscriptions: activeCustomers,
                new_this_month: newThisMonth,
                new_customers_month: newThisMonth,
                cancelled_this_month: cancelledThisMonth,
                churn_rate: parseFloat(churnRate),
                revenue_by_month: revenueByMonth,
                revenue_trend: revenueTrend,
                customers_by_plan: customersByPlan
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    }

    // ==================== Subscription Plans ====================

    async getSubscriptionPlans() {
        return this.request('subscription_plans', {
            filters: [['is_active', 'eq', true]],
            order: 'price_monthly.asc'
        });
    }

    // ==================== Customers ====================

    async getCustomers(params = {}) {
        const { filters = {}, page = 1, pageSize = 20 } = params;

        const queryFilters = [];
        if (filters.search) {
            // Supabase uses ilike for case-insensitive search
            queryFilters.push(['or', '', `(email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%)`]);
        }

        const offset = (page - 1) * pageSize;

        // Get total count
        const allCustomers = await this.request('customers', { select: 'id' });
        const total = allCustomers.length;

        // Get paginated data
        const customers = await this.request('customers', {
            order: 'created_at.desc',
            limit: pageSize,
            offset
        });

        // Get subscriptions for these customers
        const customerIds = customers.map(c => c.id);
        let subscriptions = [];
        if (customerIds.length > 0) {
            subscriptions = await this.request('subscriptions', {
                filters: [['customer_id', 'in', `(${customerIds.join(',')})`]]
            });
        }

        // Get plans
        const plans = await this.request('subscription_plans');

        // Enrich customers with subscription info
        const enrichedCustomers = customers.map(customer => {
            const subscription = subscriptions.find(s => s.customer_id === customer.id && s.status === 'Active');
            const plan = subscription ? plans.find(p => p.id === subscription.plan_id) : null;
            return {
                ...customer,
                plan_name: plan ? plan.plan_name : 'Sin plan',
                subscription_status: subscription ? subscription.status : 'Ninguna'
            };
        });

        return {
            data: enrichedCustomers,
            total,
            page,
            page_size: pageSize,
            total_pages: Math.ceil(total / pageSize)
        };
    }

    async getCustomerDetails(email) {
        const customers = await this.request('customers', {
            filters: [['email', 'eq', email]]
        });

        if (customers.length === 0) {
            throw new Error('Cliente no encontrado');
        }

        const customer = customers[0];

        // Get subscriptions
        const subscriptions = await this.request('subscriptions', {
            filters: [['customer_id', 'eq', customer.id]],
            order: 'created_at.desc'
        });

        // Get payments
        const payments = await this.request('payments', {
            filters: [['customer_id', 'eq', customer.id]],
            order: 'payment_date.desc'
        });

        // Get plans
        const plans = await this.request('subscription_plans');

        return {
            customer,
            subscriptions: subscriptions.map(s => ({
                ...s,
                plan_name: plans.find(p => p.id === s.plan_id)?.plan_name || 'Desconocido'
            })),
            payments
        };
    }

    async createCustomer(customerData) {
        const result = await this.request('customers', {
            method: 'POST',
            body: customerData
        });
        return Array.isArray(result) ? result[0] : result;
    }

    async updateCustomer(customerId, customerData) {
        const url = `${this.supabaseUrl}/rest/v1/customers?id=eq.${customerId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            throw new Error('Error actualizando cliente');
        }

        return response.json();
    }

    async deleteCustomer(customerId) {
        const url = `${this.supabaseUrl}/rest/v1/customers?id=eq.${customerId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`
            }
        });

        if (!response.ok) {
            throw new Error('Error eliminando cliente');
        }

        return { success: true };
    }

    // ==================== Subscriptions ====================

    async getSubscriptions(params = {}) {
        const { filters = {}, page = 1, pageSize = 20 } = params;

        const queryFilters = [];
        if (filters.status && filters.status !== 'all') {
            queryFilters.push(['status', 'eq', filters.status]);
        }

        const offset = (page - 1) * pageSize;

        // Get total
        const allSubs = await this.request('subscriptions', {
            select: 'id',
            filters: queryFilters
        });
        const total = allSubs.length;

        // Get paginated data
        const subscriptions = await this.request('subscriptions', {
            filters: queryFilters,
            order: 'created_at.desc',
            limit: pageSize,
            offset
        });

        // Get customers and plans
        const customers = await this.request('customers');
        const plans = await this.request('subscription_plans');

        // Enrich subscriptions
        const enrichedSubscriptions = subscriptions.map(sub => ({
            ...sub,
            customer_name: customers.find(c => c.id === sub.customer_id)?.full_name || 'Desconocido',
            customer_email: customers.find(c => c.id === sub.customer_id)?.email || '',
            plan_name: plans.find(p => p.id === sub.plan_id)?.plan_name || 'Desconocido'
        }));

        return {
            data: enrichedSubscriptions,
            total,
            page,
            page_size: pageSize,
            total_pages: Math.ceil(total / pageSize)
        };
    }

    async createSubscription(customerId, planId, billingCycle = 'Monthly') {
        // Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        if (billingCycle === 'Monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const result = await this.request('subscriptions', {
            method: 'POST',
            body: {
                customer_id: customerId,
                plan_id: planId,
                billing_cycle: billingCycle,
                status: 'Active',
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0]
            }
        });

        return Array.isArray(result) ? result[0] : result;
    }

    async cancelSubscription(subscriptionId, reason = '') {
        const url = `${this.supabaseUrl}/rest/v1/subscriptions?id=eq.${subscriptionId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                status: 'Cancelled',
                cancellation_date: new Date().toISOString().split('T')[0],
                cancellation_reason: reason
            })
        });

        if (!response.ok) {
            throw new Error('Error cancelando suscripción');
        }

        return response.json();
    }

    async upgradePlan(subscriptionId, newPlanId) {
        const url = `${this.supabaseUrl}/rest/v1/subscriptions?id=eq.${subscriptionId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                plan_id: newPlanId
            })
        });

        if (!response.ok) {
            throw new Error('Error actualizando plan');
        }

        return response.json();
    }

    async extendSubscription(subscriptionId, days) {
        // Get current subscription
        const subs = await this.request('subscriptions', {
            filters: [['id', 'eq', subscriptionId]]
        });

        if (subs.length === 0) {
            throw new Error('Suscripción no encontrada');
        }

        const sub = subs[0];
        const currentEnd = new Date(sub.end_date);
        currentEnd.setDate(currentEnd.getDate() + days);

        const url = `${this.supabaseUrl}/rest/v1/subscriptions?id=eq.${subscriptionId}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'apikey': this.supabaseKey,
                'Authorization': `Bearer ${this.supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                end_date: currentEnd.toISOString().split('T')[0]
            })
        });

        if (!response.ok) {
            throw new Error('Error extendiendo suscripción');
        }

        return response.json();
    }

    async checkSubscriptionStatus(email) {
        const customers = await this.request('customers', {
            filters: [['email', 'eq', email]]
        });

        if (customers.length === 0) {
            return { has_subscription: false, plan: null };
        }

        const customer = customers[0];
        const subscriptions = await this.request('subscriptions', {
            filters: [
                ['customer_id', 'eq', customer.id],
                ['status', 'eq', 'Active']
            ]
        });

        if (subscriptions.length === 0) {
            return { has_subscription: false, plan: null };
        }

        const subscription = subscriptions[0];
        const plans = await this.request('subscription_plans', {
            filters: [['id', 'eq', subscription.plan_id]]
        });

        return {
            has_subscription: true,
            plan: plans[0] || null,
            subscription
        };
    }

    // ==================== Payments ====================

    async getPayments(params = {}) {
        const { filters = {}, page = 1, pageSize = 20 } = params;

        const queryFilters = [];
        if (filters.dateFrom) {
            queryFilters.push(['payment_date', 'gte', filters.dateFrom]);
        }
        if (filters.dateTo) {
            queryFilters.push(['payment_date', 'lte', filters.dateTo]);
        }

        const offset = (page - 1) * pageSize;

        // Get total
        const allPayments = await this.request('payments', {
            select: 'id',
            filters: queryFilters
        });
        const total = allPayments.length;

        // Get paginated data
        const payments = await this.request('payments', {
            filters: queryFilters,
            order: 'payment_date.desc',
            limit: pageSize,
            offset
        });

        // Get customers
        const customers = await this.request('customers');

        // Enrich payments
        const enrichedPayments = payments.map(payment => ({
            ...payment,
            customer_name: customers.find(c => c.id === payment.customer_id)?.full_name || 'Desconocido',
            customer_email: customers.find(c => c.id === payment.customer_id)?.email || ''
        }));

        return {
            data: enrichedPayments,
            total,
            page,
            page_size: pageSize,
            total_pages: Math.ceil(total / pageSize)
        };
    }

    async processPayment(paymentData) {
        const result = await this.request('payments', {
            method: 'POST',
            body: {
                customer_id: paymentData.customer_id,
                subscription_id: paymentData.subscription_id,
                amount: paymentData.amount,
                payment_method: paymentData.payment_method || 'Manual',
                status: 'Completed',
                transaction_id: paymentData.transaction_id || `TXN-${Date.now()}`
            }
        });

        return Array.isArray(result) ? result[0] : result;
    }

    // ==================== Reports ====================

    async exportReport(reportType, dateFrom = null, dateTo = null) {
        switch (reportType) {
            case 'customers':
                return this.request('customers', { order: 'created_at.desc' });

            case 'subscriptions':
                const subs = await this.request('subscriptions', { order: 'created_at.desc' });
                const customers = await this.request('customers');
                const plans = await this.request('subscription_plans');
                return subs.map(s => ({
                    ...s,
                    customer_email: customers.find(c => c.id === s.customer_id)?.email,
                    plan_name: plans.find(p => p.id === s.plan_id)?.plan_name
                }));

            case 'payments':
                const queryFilters = [];
                if (dateFrom) queryFilters.push(['payment_date', 'gte', dateFrom]);
                if (dateTo) queryFilters.push(['payment_date', 'lte', dateTo]);
                return this.request('payments', {
                    filters: queryFilters,
                    order: 'payment_date.desc'
                });

            case 'revenue':
                const allPayments = await this.request('payments', {
                    filters: [['status', 'eq', 'Completed']],
                    order: 'payment_date.desc'
                });
                // Group by month
                const byMonth = {};
                allPayments.forEach(p => {
                    const month = p.payment_date.substring(0, 7);
                    byMonth[month] = (byMonth[month] || 0) + p.amount;
                });
                return Object.entries(byMonth).map(([month, total]) => ({ month, total }));

            default:
                throw new Error('Tipo de reporte no válido');
        }
    }

    // ==================== Authentication ====================

    /**
     * Hash a password using SHA-256
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Register a new user
     */
    async registerUser({ email, password, name, goal, duration }) {
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existing = await this.request('customers', {
            filters: [['email', 'eq', normalizedEmail]]
        });

        if (existing && existing.length > 0) {
            throw new Error('Ya existe una cuenta con este email');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create user in Supabase
        const userData = {
            email: normalizedEmail,
            full_name: name.trim(),
            password_hash: passwordHash,
            goal: goal || 'personal',
            duration: duration || 60,
            start_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };

        const result = await this.createCustomer(userData);
        return result;
    }

    /**
     * Login user - verify credentials against Supabase
     */
    async loginUser(email, password) {
        const normalizedEmail = email.toLowerCase().trim();

        // Find user by email
        const users = await this.request('customers', {
            filters: [['email', 'eq', normalizedEmail]]
        });

        if (!users || users.length === 0) {
            throw new Error('No existe una cuenta con este email');
        }

        const user = users[0];

        // Verify password
        const passwordHash = await this.hashPassword(password);

        if (user.password_hash !== passwordHash) {
            throw new Error('Contraseña incorrecta');
        }

        return user;
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        const users = await this.request('customers', {
            filters: [['email', 'eq', normalizedEmail]]
        });

        return users && users.length > 0 ? users[0] : null;
    }

    /**
     * Update user password
     */
    async updateUserPassword(email, newPassword) {
        const user = await this.getUserByEmail(email);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const passwordHash = await this.hashPassword(newPassword);
        await this.updateCustomer(user.id, { password_hash: passwordHash });
    }

    // ==================== Utility Methods ====================

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Intl.DateTimeFormat('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(dateStr));
    }

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
}

// Create singleton instance
const supabaseAPI = new SupabaseAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SupabaseAPI, supabaseAPI };
}

// Expose globally
window.SupabaseAPI = SupabaseAPI;
window.supabaseAPI = supabaseAPI;
