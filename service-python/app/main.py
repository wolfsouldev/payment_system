from fastapi import FastAPI, HTTPException, status

from app.schemas import HealthResponse, ProcesarPagoRequest, ProcesarPagoResponse
from app.services.payment_processor import procesar_pago

app = FastAPI(
    title="Servicio de Procesamiento de Pagos",
    description=(
        "Microservicio en Python (FastAPI) que simula el procesamiento de pagos. "
        "Recibe un monto y responde con un resultado aleatorio: "
        "**80% aprobado** / **20% rechazado**."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Pagos",
            "description": "Operaciones de procesamiento de pagos.",
        },
        {
            "name": "Health",
            "description": "Verificación del estado del servicio.",
        },
    ],
)


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Health check",
    description="Verifica que el servicio esté activo y funcionando.",
)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="payment-processor",
        version="1.0.0",
    )


@app.post(
    "/procesar-pago",
    response_model=ProcesarPagoResponse,
    tags=["Pagos"],
    summary="Procesar un pago",
    description=(
        "Simula el procesamiento de un pago. "
        "El resultado es aleatorio: 80% de probabilidad de aprobación "
        "y 20% de rechazo."
    ),
    status_code=status.HTTP_200_OK,
)
async def procesar_pago_endpoint(
    request: ProcesarPagoRequest,
) -> ProcesarPagoResponse:
    try:
        resultado = procesar_pago(request)
        return resultado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar el pago: {str(e)}",
        )
