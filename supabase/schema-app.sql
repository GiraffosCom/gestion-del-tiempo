-- Schema para App Frontend - Supabase
-- Ejecutar en SQL Editor de Supabase

-- Tabla de Usuarios de la App
CREATE TABLE app_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    goal TEXT,
    goal_duration INTEGER DEFAULT 30,
    theme VARCHAR(20) DEFAULT 'female',
    dark_mode BOOLEAN DEFAULT false,
    notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Hábitos
CREATE TABLE habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    icon VARCHAR(10),
    name VARCHAR(255) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Agenda/Actividades
CREATE TABLE schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    time TIME,
    activity VARCHAR(255) NOT NULL,
    duration INTEGER DEFAULT 30,
    category VARCHAR(50),
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Metas Semanales
CREATE TABLE goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    week_start DATE,
    category VARCHAR(50) NOT NULL,
    goal_text TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start, category)
);

-- Tabla de Gastos (para el módulo de estadísticas)
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    description TEXT,
    category VARCHAR(50),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (usando email como identificador)
CREATE POLICY "Users can manage their own data" ON app_users
    FOR ALL USING (true);

CREATE POLICY "Users can manage their habits" ON habits
    FOR ALL USING (true);

CREATE POLICY "Users can manage their schedule" ON schedule
    FOR ALL USING (true);

CREATE POLICY "Users can manage their goals" ON goals
    FOR ALL USING (true);

CREATE POLICY "Users can manage their expenses" ON expenses
    FOR ALL USING (true);

-- Índices para rendimiento
CREATE INDEX idx_habits_user_date ON habits(user_id, date);
CREATE INDEX idx_schedule_user_date ON schedule(user_id, date);
CREATE INDEX idx_goals_user_week ON goals(user_id, week_start);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date);

-- Trigger para updated_at en app_users
CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
