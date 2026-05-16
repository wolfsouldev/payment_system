from pydantic import BaseModel, Field
from enum import Enum


class EstadoPago(str, Enum):
    APROBADO = "aprobado"
    RECHAZADO = "rechazado"


class ProcesarPagoRequest(BaseModel):
    """Esquema de solicitud para procesar un pago."""

    monto: float = Field(
        ...,
        gt=0,
        description="Monto del pago a procesar. Debe ser mayor a 0.",
        examples=[1500.00],
    )
    moneda: str = Field(
        default="MXN",
        min_length=3,
        max_length=3,
        description="Código ISO 4217 de la moneda.",
        examples=["MXN"],
    )
    descripcion: str | None = Field(
        default=None,
        max_length=500,
        description="Descripción opcional del pago.",
        examples=["Compra en línea"],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "monto": 1500.00,
                    "moneda": "MXN",
                    "descripcion": "Compra en línea - Electrónica",
                }
            ]
        }
    }


class ProcesarPagoResponse(BaseModel):
    """Esquema de respuesta del procesamiento de pago."""

    aprobado: bool = Field(
        description="Indica si el pago fue aprobado o rechazado."
    )
    estado: EstadoPago = Field(
        description="Estado resultante del pago."
    )
    monto: float = Field(
        description="Monto procesado."
    )
    moneda: str = Field(
        description="Moneda del pago."
    )
    referencia: str = Field(
        description="Código de referencia único generado para la transacción."
    )
    mensaje: str = Field(
        description="Mensaje descriptivo del resultado."
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "aprobado": True,
                    "estado": "aprobado",
                    "monto": 1500.00,
                    "moneda": "MXN",
                    "referencia": "REF-20240115-ABC12345",
                    "mensaje": "Pago aprobado exitosamente.",
                }
            ]
        }
    }


class HealthResponse(BaseModel):
    """Esquema de respuesta para el health check."""

    status: str = Field(description="Estado del servicio.")
    service: str = Field(description="Nombre del servicio.")
    version: str = Field(description="Versión del servicio.")
