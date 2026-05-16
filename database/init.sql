-- ============================================
-- Sistema de Pagos - Inicialización de Base de Datos
-- ============================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabla: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      VARCHAR(100)  NOT NULL,
    apellido    VARCHAR(100)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    telefono    VARCHAR(20),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabla: tarjetas
-- ============================================
CREATE TABLE IF NOT EXISTS tarjetas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    numero_tarjeta  VARCHAR(19)   NOT NULL,   -- formato: XXXX-XXXX-XXXX-XXXX
    titular         VARCHAR(200)  NOT NULL,
    fecha_expiracion VARCHAR(5)   NOT NULL,   -- formato: MM/YY
    tipo            VARCHAR(20)   NOT NULL DEFAULT 'credito' CHECK (tipo IN ('credito', 'debito')),
    marca           VARCHAR(20)   NOT NULL DEFAULT 'visa'    CHECK (marca IN ('visa', 'mastercard', 'amex')),
    activa          BOOLEAN       NOT NULL DEFAULT TRUE,
    csv             VARCHAR(1000),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Tabla: pagos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id      UUID           NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tarjeta_id      UUID           NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
    monto           NUMERIC(12,2)  NOT NULL CHECK (monto > 0),
    moneda          VARCHAR(3)     NOT NULL DEFAULT 'MXN',
    descripcion     VARCHAR(500),
    estado          VARCHAR(20)    NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    referencia      VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tarjetas_usuario_id ON tarjetas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario_id    ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_tarjeta_id    ON pagos(tarjeta_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado        ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at    ON pagos(created_at DESC);

-- ============================================
-- Función: actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_tarjetas_updated_at
    BEFORE UPDATE ON tarjetas
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_pagos_updated_at
    BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
