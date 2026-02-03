/**
 * Sync Service for Gestion del Tiempo App
 * Handles data synchronization between localStorage and Supabase
 */

class SyncService {
    constructor() {
        this.supabaseUrl = 'https://crpotifjwqoljvcvsdje.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycG90aWZqd3FvbGp2Y3ZzZGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODI2NzAsImV4cCI6MjA4NTY1ODY3MH0.T33BIMza0J7AZA2juSEBA7GZOcw8RG6ePMzdRVjdnGg';
        this.isOnline = navigator.onLine;
        this.userId = null;
        this.userEmail = null;

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncAll();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    /**
     * Make a request to Supabase REST API
     */
    async request(table, options = {}) {
        const { method = 'GET', filters = [], body = null, select = '*', order = null, upsert = false } = options;

        let url = `${this.supabaseUrl}/rest/v1/${table}?select=${select}`;

        filters.forEach(([column, operator, value]) => {
            url += `&${column}=${operator}.${encodeURIComponent(value)}`;
        });

        if (order) {
            url += `&order=${order}`;
        }

        const headers = {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': upsert ? 'resolution=merge-duplicates,return=representation' : 'return=representation'
        };

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

            if (response.status === 204) return { success: true };
            return response.json();
        } catch (error) {
            console.error('Sync API Error:', error);
            throw error;
        }
    }

    /**
     * Initialize user - get from customers table
     */
    async initUser(email, name = '') {
        if (!email) {
            console.log('No email provided, using localStorage only');
            return null;
        }

        this.userEmail = email;

        try {
            // Try to get existing user from customers table
            let users = await this.request('customers', {
                filters: [['email', 'eq', email]]
            });

            if (users.length > 0) {
                this.userId = users[0].id;
                console.log('Sync service initialized with customer ID:', this.userId);
                return users[0];
            }

            // User not found in Supabase - they may have registered locally only
            console.log('User not found in Supabase, using localStorage only');
            return null;
        } catch (error) {
            console.error('Error initializing user:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    async updateUser(data) {
        if (!this.userId) return null;

        try {
            const url = `${this.supabaseUrl}/rest/v1/customers?id=eq.${this.userId}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(data)
            });
            return response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            return null;
        }
    }

    // ==================== Generic User Data ====================

    /**
     * Get user data by type
     */
    async getUserData(dataType, dataKey = null) {
        if (!this.userId) return null;

        try {
            const filters = [
                ['customer_id', 'eq', this.userId],
                ['data_type', 'eq', dataType]
            ];

            if (dataKey) {
                filters.push(['data_key', 'eq', dataKey]);
            }

            const result = await this.request('user_data', { filters });
            return result;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    /**
     * Save user data (upsert)
     */
    async saveUserData(dataType, dataKey, dataValue) {
        // Always save to localStorage first
        const localKey = `${this.userEmail.replace(/[^a-z0-9]/gi, '_')}-${dataType}${dataKey ? '-' + dataKey : ''}`;
        localStorage.setItem(localKey, JSON.stringify(dataValue));

        if (!this.userId || !this.isOnline) return { local: true };

        try {
            // Check if exists
            const existing = await this.getUserData(dataType, dataKey);

            if (existing && existing.length > 0) {
                // Update existing
                const url = `${this.supabaseUrl}/rest/v1/user_data?id=eq.${existing[0].id}`;
                const response = await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        data_value: dataValue,
                        updated_at: new Date().toISOString()
                    })
                });
                return response.json();
            } else {
                // Insert new
                const result = await this.request('user_data', {
                    method: 'POST',
                    body: {
                        customer_id: this.userId,
                        data_type: dataType,
                        data_key: dataKey || dataType,
                        data_value: dataValue,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                });
                return result;
            }
        } catch (error) {
            console.error('Error saving user data:', error);
            return { local: true, error: error.message };
        }
    }

    /**
     * Get all user data and sync to localStorage
     */
    async downloadAllUserData() {
        if (!this.userId || !this.isOnline) return false;

        try {
            const allData = await this.request('user_data', {
                filters: [['customer_id', 'eq', this.userId]],
                order: 'updated_at.desc'
            });

            const userKey = this.userEmail.replace(/[^a-z0-9]/gi, '_');

            for (const item of allData) {
                const localKey = `${userKey}-${item.data_type}${item.data_key && item.data_key !== item.data_type ? '-' + item.data_key : ''}`;
                localStorage.setItem(localKey, JSON.stringify(item.data_value));
            }

            console.log(`Downloaded ${allData.length} data items from Supabase`);
            return true;
        } catch (error) {
            console.error('Error downloading user data:', error);
            return false;
        }
    }

    // ==================== Habits ====================

    async getHabits(date = null) {
        if (!this.userId) return this.getLocalHabits(date);

        try {
            const filters = [['customer_id', 'eq', this.userId]];
            if (date) {
                filters.push(['date', 'eq', date]);
            }

            const habits = await this.request('habits', {
                filters,
                order: 'created_at.asc'
            });

            // Update localStorage as cache
            this.saveLocalHabits(habits, date);
            return habits;
        } catch (error) {
            console.error('Error getting habits:', error);
            return this.getLocalHabits(date);
        }
    }

    async saveHabit(habit) {
        // Always save to localStorage first
        this.saveHabitLocal(habit);

        if (!this.userId) return habit;

        try {
            const habitData = {
                customer_id: this.userId,
                icon: habit.icon,
                name: habit.name,
                date: habit.date || new Date().toISOString().split('T')[0],
                completed: habit.completed || false
            };

            if (habit.id && !habit.id.startsWith('local_')) {
                // Update existing
                const url = `${this.supabaseUrl}/rest/v1/habits?id=eq.${habit.id}`;
                await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(habitData)
                });
                return habit;
            } else {
                // Create new
                const result = await this.request('habits', {
                    method: 'POST',
                    body: habitData
                });
                return Array.isArray(result) ? result[0] : result;
            }
        } catch (error) {
            console.error('Error saving habit:', error);
            return habit;
        }
    }

    async deleteHabit(habitId) {
        this.deleteHabitLocal(habitId);

        if (!this.userId || habitId.startsWith('local_')) return;

        try {
            const url = `${this.supabaseUrl}/rest/v1/habits?id=eq.${habitId}`;
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
        } catch (error) {
            console.error('Error deleting habit:', error);
        }
    }

    async toggleHabit(habitId, completed) {
        this.toggleHabitLocal(habitId, completed);

        if (!this.userId || habitId.startsWith('local_')) return;

        try {
            const url = `${this.supabaseUrl}/rest/v1/habits?id=eq.${habitId}`;
            await fetch(url, {
                method: 'PATCH',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed })
            });
        } catch (error) {
            console.error('Error toggling habit:', error);
        }
    }

    // ==================== Schedule ====================

    async getSchedule(date = null) {
        if (!this.userId) return this.getLocalSchedule(date);

        try {
            const filters = [['customer_id', 'eq', this.userId]];
            if (date) {
                filters.push(['date', 'eq', date]);
            }

            const schedule = await this.request('schedule', {
                filters,
                order: 'time.asc'
            });

            this.saveLocalSchedule(schedule, date);
            return schedule;
        } catch (error) {
            console.error('Error getting schedule:', error);
            return this.getLocalSchedule(date);
        }
    }

    async saveScheduleItem(item) {
        this.saveScheduleItemLocal(item);

        if (!this.userId) return item;

        try {
            const itemData = {
                customer_id: this.userId,
                date: item.date || new Date().toISOString().split('T')[0],
                time: item.time,
                activity: item.activity,
                duration: item.duration || 30,
                category: item.category,
                completed: item.completed || false
            };

            if (item.id && !item.id.startsWith('local_')) {
                const url = `${this.supabaseUrl}/rest/v1/schedule?id=eq.${item.id}`;
                await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(itemData)
                });
                return item;
            } else {
                const result = await this.request('schedule', {
                    method: 'POST',
                    body: itemData
                });
                return Array.isArray(result) ? result[0] : result;
            }
        } catch (error) {
            console.error('Error saving schedule item:', error);
            return item;
        }
    }

    async deleteScheduleItem(itemId) {
        this.deleteScheduleItemLocal(itemId);

        if (!this.userId || itemId.startsWith('local_')) return;

        try {
            const url = `${this.supabaseUrl}/rest/v1/schedule?id=eq.${itemId}`;
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
        } catch (error) {
            console.error('Error deleting schedule item:', error);
        }
    }

    // ==================== Goals ====================

    async getGoals(weekStart = null) {
        if (!this.userId) return this.getLocalGoals();

        try {
            const filters = [['customer_id', 'eq', this.userId]];
            if (weekStart) {
                filters.push(['week_start', 'eq', weekStart]);
            }

            const goals = await this.request('goals', {
                filters,
                order: 'category.asc'
            });

            this.saveLocalGoals(goals);
            return goals;
        } catch (error) {
            console.error('Error getting goals:', error);
            return this.getLocalGoals();
        }
    }

    async saveGoal(goal) {
        this.saveGoalLocal(goal);

        if (!this.userId) return goal;

        try {
            const weekStart = this.getWeekStart();
            const goalData = {
                customer_id: this.userId,
                week_start: goal.week_start || weekStart,
                category: goal.category,
                goal_text: goal.goal_text || goal.text,
                completed: goal.completed || false
            };

            // Use upsert for goals (unique by customer_id, week_start, category)
            const result = await this.request('goals', {
                method: 'POST',
                body: goalData,
                upsert: true
            });
            return Array.isArray(result) ? result[0] : result;
        } catch (error) {
            console.error('Error saving goal:', error);
            return goal;
        }
    }

    // ==================== Expenses ====================

    async getExpenses(startDate = null, endDate = null) {
        if (!this.userId) return this.getLocalExpenses();

        try {
            const filters = [['customer_id', 'eq', this.userId]];
            if (startDate) filters.push(['date', 'gte', startDate]);
            if (endDate) filters.push(['date', 'lte', endDate]);

            const expenses = await this.request('expenses', {
                filters,
                order: 'date.desc'
            });

            this.saveLocalExpenses(expenses);
            return expenses;
        } catch (error) {
            console.error('Error getting expenses:', error);
            return this.getLocalExpenses();
        }
    }

    async saveExpense(expense) {
        this.saveExpenseLocal(expense);

        if (!this.userId) return expense;

        try {
            const expenseData = {
                customer_id: this.userId,
                amount: expense.amount,
                description: expense.description,
                category: expense.category,
                date: expense.date || new Date().toISOString().split('T')[0]
            };

            const result = await this.request('expenses', {
                method: 'POST',
                body: expenseData
            });
            return Array.isArray(result) ? result[0] : result;
        } catch (error) {
            console.error('Error saving expense:', error);
            return expense;
        }
    }

    async deleteExpense(expenseId) {
        this.deleteExpenseLocal(expenseId);

        if (!this.userId || expenseId.startsWith('local_')) return;

        try {
            const url = `${this.supabaseUrl}/rest/v1/expenses?id=eq.${expenseId}`;
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    }

    // ==================== Sync All ====================

    async syncAll() {
        if (!this.userId || !this.isOnline) {
            console.log('Cannot sync - offline or no user ID');
            return;
        }

        console.log('Syncing all data with Supabase...');

        try {
            // First download any data from Supabase that we don't have locally
            await this.downloadAllUserData();

            // Then sync local data that hasn't been synced
            await this.syncLocalHabits();
            await this.syncLocalSchedule();
            await this.syncLocalGoals();
            await this.syncLocalExpenses();
            await this.uploadLocalUserData();

            console.log('Sync completed');
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    /**
     * Upload all local user data to Supabase
     */
    async uploadLocalUserData() {
        if (!this.userId || !this.userEmail) return;

        const userKey = this.userEmail.replace(/[^a-z0-9]/gi, '_');
        const dataTypes = [
            'custom-habits', 'custom-gym', 'custom-goals', 'gym',
            'meals', 'weights', 'workout-logs', 'protein-log',
            'protein-favorites', 'notes', 'user-profile',
            'reminder-settings', 'notifications'
        ];

        for (const dataType of dataTypes) {
            const localKey = `${userKey}-${dataType}`;
            const localData = localStorage.getItem(localKey);

            if (localData) {
                try {
                    const value = JSON.parse(localData);
                    await this.saveUserData(dataType, dataType, value);
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        }
    }

    async syncLocalHabits() {
        const localHabits = JSON.parse(localStorage.getItem('habits') || '[]');
        const unsyncedHabits = localHabits.filter(h => h.id && h.id.startsWith('local_'));

        for (const habit of unsyncedHabits) {
            const newHabit = { ...habit, id: undefined };
            await this.saveHabit(newHabit);
        }
    }

    async syncLocalSchedule() {
        const localSchedule = JSON.parse(localStorage.getItem('schedule') || '[]');
        const unsyncedItems = localSchedule.filter(s => s.id && s.id.startsWith('local_'));

        for (const item of unsyncedItems) {
            const newItem = { ...item, id: undefined };
            await this.saveScheduleItem(newItem);
        }
    }

    async syncLocalGoals() {
        const localGoals = JSON.parse(localStorage.getItem('weeklyGoals') || '{}');
        for (const [category, text] of Object.entries(localGoals)) {
            if (text) {
                await this.saveGoal({ category, goal_text: text });
            }
        }
    }

    async syncLocalExpenses() {
        const localExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const unsyncedExpenses = localExpenses.filter(e => e.id && e.id.startsWith('local_'));

        for (const expense of unsyncedExpenses) {
            const newExpense = { ...expense, id: undefined };
            await this.saveExpense(newExpense);
        }
    }

    // ==================== LocalStorage Helpers ====================

    getLocalHabits(date) {
        const habits = JSON.parse(localStorage.getItem('habits') || '[]');
        if (date) {
            return habits.filter(h => h.date === date);
        }
        return habits;
    }

    saveLocalHabits(habits, date) {
        if (date) {
            const existing = this.getLocalHabits().filter(h => h.date !== date);
            localStorage.setItem('habits', JSON.stringify([...existing, ...habits]));
        } else {
            localStorage.setItem('habits', JSON.stringify(habits));
        }
    }

    saveHabitLocal(habit) {
        const habits = this.getLocalHabits();
        const index = habits.findIndex(h => h.id === habit.id);
        if (index >= 0) {
            habits[index] = habit;
        } else {
            habit.id = habit.id || 'local_' + Date.now();
            habits.push(habit);
        }
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    deleteHabitLocal(habitId) {
        const habits = this.getLocalHabits().filter(h => h.id !== habitId);
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    toggleHabitLocal(habitId, completed) {
        const habits = this.getLocalHabits();
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            habit.completed = completed;
            localStorage.setItem('habits', JSON.stringify(habits));
        }
    }

    getLocalSchedule(date) {
        const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
        if (date) {
            return schedule.filter(s => s.date === date);
        }
        return schedule;
    }

    saveLocalSchedule(schedule, date) {
        if (date) {
            const existing = this.getLocalSchedule().filter(s => s.date !== date);
            localStorage.setItem('schedule', JSON.stringify([...existing, ...schedule]));
        } else {
            localStorage.setItem('schedule', JSON.stringify(schedule));
        }
    }

    saveScheduleItemLocal(item) {
        const schedule = this.getLocalSchedule();
        const index = schedule.findIndex(s => s.id === item.id);
        if (index >= 0) {
            schedule[index] = item;
        } else {
            item.id = item.id || 'local_' + Date.now();
            schedule.push(item);
        }
        localStorage.setItem('schedule', JSON.stringify(schedule));
    }

    deleteScheduleItemLocal(itemId) {
        const schedule = this.getLocalSchedule().filter(s => s.id !== itemId);
        localStorage.setItem('schedule', JSON.stringify(schedule));
    }

    getLocalGoals() {
        return JSON.parse(localStorage.getItem('weeklyGoals') || '{}');
    }

    saveLocalGoals(goals) {
        const goalsObj = {};
        goals.forEach(g => {
            goalsObj[g.category] = g.goal_text;
        });
        localStorage.setItem('weeklyGoals', JSON.stringify(goalsObj));
    }

    saveGoalLocal(goal) {
        const goals = this.getLocalGoals();
        goals[goal.category] = goal.goal_text || goal.text;
        localStorage.setItem('weeklyGoals', JSON.stringify(goals));
    }

    getLocalExpenses() {
        return JSON.parse(localStorage.getItem('expenses') || '[]');
    }

    saveLocalExpenses(expenses) {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    saveExpenseLocal(expense) {
        const expenses = this.getLocalExpenses();
        expense.id = expense.id || 'local_' + Date.now();
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    deleteExpenseLocal(expenseId) {
        const expenses = this.getLocalExpenses().filter(e => e.id !== expenseId);
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    // ==================== Utilities ====================

    getWeekStart() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        return monday.toISOString().split('T')[0];
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }
}

// Create singleton instance
const syncService = new SyncService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SyncService, syncService };
}

window.SyncService = SyncService;
window.syncService = syncService;
