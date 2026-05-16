import random
import uuid
import logging
from datetime import datetime, timezone

from app.schemas import EstadoPago, ProcesarPagoRequest, ProcesarPagoResponse

logger = logging.getLogger(__name__)
PROBABILIDAD_APROBACION = 0.80


def generar_referencia() -> str:
    """Genera un código de referencia único para la transacción."""
    fecha = datetime.now(timezone.utc).strftime("%Y%m%d")
    codigo = uuid.uuid4().hex[:8].upper()
    return f"REF-{fecha}-{codigo}"


def procesar_pago(request: ProcesarPagoRequest) -> ProcesarPagoResponse:
    """
    Simula el procesamiento de un pago.

    La aprobación se determina aleatoriamente:
    - 80% de probabilidad de ser aprobado.
    - 20% de probabilidad de ser rechazado.
    """

    if request.monto <= 0:
        raise ValueError(f"El monto debe ser mayor a 0, recibido: {request.monto}")

    aprobado = random.random() < PROBABILIDAD_APROBACION
    estado = EstadoPago.APROBADO if aprobado else EstadoPago.RECHAZADO

    mensaje = (
        "Pago aprobado exitosamente."
        if aprobado
        else "Pago rechazado. Fondos insuficientes o tarjeta inválida."
    )

    referencia = generar_referencia()

    logger.info(
        "Pago procesado — referencia: %s | monto: %s %s | estado: %s",
        referencia,
        request.monto,
        request.moneda,
        estado,
    )

    return ProcesarPagoResponse(
        aprobado=aprobado,
        estado=estado,
        monto=request.monto,
        moneda=request.moneda,
        referencia=referencia,
        mensaje=mensaje,
    )
