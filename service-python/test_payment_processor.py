from unittest.mock import patch

import pytest

from app.schemas import EstadoPago, ProcesarPagoRequest
from app.services.payment_processor import generar_referencia, procesar_pago


def test_generar_referencia_devuelve_formato_esperado():
    referencia = generar_referencia()

    assert referencia.startswith('REF-')
    assert len(referencia.split('-')) == 3


def test_procesar_pago_aprobado():
    request = ProcesarPagoRequest(
        monto=1500.0,
        moneda='MXN',
        descripcion='Compra en línea',
    )

    with patch('app.services.payment_processor.random.random', return_value=0.2):
        response = procesar_pago(request)

    assert response.aprobado is True
    assert response.estado == EstadoPago.APROBADO
    assert response.monto == 1500.0
    assert response.moneda == 'MXN'
    assert response.referencia.startswith('REF-')


def test_procesar_pago_rechazado():
    request = ProcesarPagoRequest(
        monto=1500.0,
        moneda='MXN',
        descripcion='Compra en línea',
    )

    with patch('app.services.payment_processor.random.random', return_value=0.95):
        response = procesar_pago(request)

    assert response.aprobado is False
    assert response.estado == EstadoPago.RECHAZADO
    assert 'rechazado' in response.mensaje.lower()


def test_procesar_pago_lanza_error_si_monto_no_es_valido():
    request = ProcesarPagoRequest.model_construct(
        monto=0,
        moneda='MXN',
        descripcion='Inválido',
    )

    with pytest.raises(ValueError, match='El monto debe ser mayor a 0'):
        procesar_pago(request)
