-- ============================================
-- Sistema de Pagos - Datos de Ejemplo (Seed)
-- ============================================

-- Usuarios de ejemplo
INSERT INTO usuarios (id, nombre, apellido, email, telefono) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Carlos',  'García',    'carlos.garcia@email.com',  '+52 55 1234 5678'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'María',   'López',     'maria.lopez@email.com',    '+52 55 2345 6789'),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Juan',    'Martínez',  'juan.martinez@email.com',  '+52 55 3456 7890'),
    ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Ana',     'Rodríguez', 'ana.rodriguez@email.com',  '+52 55 4567 8901'),
    ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Roberto', 'Hernández', 'roberto.hernandez@email.com', '+52 55 5678 9012')
ON CONFLICT (email) DO NOTHING;

-- Tarjetas de ejemplo (datos ficticios)
INSERT INTO tarjetas (id, usuario_id, numero_tarjeta, titular, fecha_expiracion, tipo, marca, csv) VALUES
    ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '4111-1111-1111-1111', 'CARLOS GARCIA',    '12/28', 'credito', 'visa', '4111111111111111,12/28,123'),
    ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '5500-0000-0000-0004', 'CARLOS GARCIA',    '06/27', 'credito', 'mastercard', '5500000000000004,06/27,456'),
    ('33333333-3333-3333-3333-333333333333', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', '4000-0000-0000-0002', 'MARIA LOPEZ',      '03/29', 'credito', 'visa', '4000000000000002,03/29,789'),
    ('44444444-4444-4444-4444-444444444444', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '3400-0000-0000-009',  'JUAN MARTINEZ',    '09/26', 'credito', 'amex', '340000000000009,09/26,012'),
    ('55555555-5555-5555-5555-555555555555', 'd4e5f6a7-b8c9-0123-defa-234567890123', '4111-1111-1111-1234', 'ANA RODRIGUEZ',    '01/30', 'debito',  'visa', '4111111111111234,01/30,345'),
    ('66666666-6666-6666-6666-666666666666', 'e5f6a7b8-c9d0-1234-efab-345678901234', '5500-0000-0000-1234', 'ROBERTO HERNANDEZ','11/27', 'credito', 'mastercard', '5500000000001234,11/27,678')
ON CONFLICT DO NOTHING;

-- Pagos de ejemplo
INSERT INTO pagos (usuario_id, tarjeta_id, monto, moneda, descripcion, estado, referencia) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', 1500.00, 'MXN', 'Compra en línea - Electrónica',   'aprobado',  'REF-001-2024'),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '22222222-2222-2222-2222-222222222222', 350.50,  'MXN', 'Suscripción mensual streaming',   'aprobado',  'REF-002-2024'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '33333333-3333-3333-3333-333333333333', 8900.00, 'MXN', 'Compra en tienda departamental',   'aprobado',  'REF-003-2024'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '33333333-3333-3333-3333-333333333333', 250.00,  'MXN', 'Pago de servicio',                'rechazado', 'REF-004-2024'),
    ('c3d4e5f6-a7b8-9012-cdef-123456789012', '44444444-4444-4444-4444-444444444444', 15000.00,'MXN', 'Reservación de hotel',             'aprobado',  'REF-005-2024'),
    ('d4e5f6a7-b8c9-0123-defa-234567890123', '55555555-5555-5555-5555-555555555555', 499.99,  'MXN', 'Compra de software',              'aprobado',  'REF-006-2024'),
    ('e5f6a7b8-c9d0-1234-efab-345678901234', '66666666-6666-6666-6666-666666666666', 2100.00, 'MXN', 'Pago de seguro',                  'rechazado', 'REF-007-2024')
ON CONFLICT DO NOTHING;
