-- Schema para Gestion del Tiempo - Supabase
-- Ejecutar en SQL Editor de Supabase

-- Tabla de Planes de Suscripción
CREATE TABLE subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    price_monthly INTEGER DEFAULT 0,
    price_yearly INTEGER DEFAULT 0,
    features TEXT,
    max_habits INTEGER DEFAULT 5,
    max_goals INTEGER DEFAULT 3,
    has_statistics BOOLEAN DEFAULT false,
    has_export BOOLEAN DEFAULT false,
    has_priority_support BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    goal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Suscripciones
CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Cancelled', 'Expired')),
    billing_cycle VARCHAR(20) DEFAULT 'Monthly' CHECK (billing_cycle IN ('Monthly', 'Yearly')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    cancellation_date DATE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Pagos
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar planes por defecto
INSERT INTO subscription_plans (plan_name, is_active, price_monthly, price_yearly, features, max_habits, max_goals, has_statistics, has_export, has_priority_support) VALUES
('Free', true, 0, 0, 'Plan gratuito con funciones basicas:
- Hasta 5 habitos
- 3 metas semanales
- Agenda diaria', 5, 3, false, false, false),
('Pro', true, 9900, 99000, 'Plan Pro con todas las funciones:
- Habitos ilimitados
- Metas ilimitadas
- Estadisticas avanzadas
- Exportar datos
- Temas personalizados', 999, 999, true, true, false),
('Teams', true, 29900, 299000, 'Plan Teams para equipos:
- Todo lo de Pro
- Hasta 10 usuarios
- Dashboard de equipo
- Soporte prioritario
- Reportes personalizados', 999, 999, true, true, true);

-- Habilitar Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público para lectura de planes
CREATE POLICY "Plans are viewable by everyone" ON subscription_plans
    FOR SELECT USING (true);

-- Políticas para el backoffice (usando anon key temporalmente)
-- En producción, deberías usar autenticación de Supabase
CREATE POLICY "Enable all access for customers" ON customers
    FOR ALL USING (true);

CREATE POLICY "Enable all access for subscriptions" ON subscriptions
    FOR ALL USING (true);

CREATE POLICY "Enable all access for payments" ON payments
    FOR ALL USING (true);

-- Índices para mejor rendimiento
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
