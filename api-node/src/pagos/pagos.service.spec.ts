import {
  BadGatewayException,
  ForbiddenException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";

import { PagosService } from "./pagos.service";

describe("PagosService", () => {
  let service: PagosService;
  let db: any;
  let usuariosService: any;
  let tarjetasService: any;

  beforeEach(() => {
    db = {
      insert: jest.fn(),
      select: jest.fn(),
    };

    usuariosService = {
      findOne: jest.fn(),
    };

    tarjetasService = {
      findOne: jest.fn(),
    };

    service = new PagosService(db, usuariosService, tarjetasService);
    process.env.PYTHON_SERVICE_URL = "http://localhost:8000";
  });

  it("creates a payment successfully when python service and db succeed", async () => {
    const dto = {
      usuarioId: "user-1",
      tarjetaId: "card-1",
      monto: 250.5,
      moneda: "MXN",
      descripcion: "Compra",
    };
    const tarjeta = { id: "card-1", usuarioId: "user-1" };
    const responsePayload = {
      aprobado: true,
      estado: "aprobado",
      referencia: "REF-123",
    };
    const storedPago = {
      id: "pago-1",
      usuarioId: dto.usuarioId,
      tarjetaId: dto.tarjetaId,
      monto: "250.50",
      moneda: "MXN",
      descripcion: dto.descripcion,
      estado: "aprobado",
      referencia: "REF-123",
    };

    usuariosService.findOne.mockResolvedValue({ id: dto.usuarioId });
    tarjetasService.findOne.mockResolvedValue(tarjeta);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(responsePayload),
    } as any);

    const returning = jest.fn().mockResolvedValue([storedPago]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    await expect(service.create(dto as any)).resolves.toEqual({
      ...storedPago,
      procesamiento: responsePayload,
    });
  });

  it("throws ForbiddenException when card does not belong to user", async () => {
    usuariosService.findOne.mockResolvedValue({ id: "user-1" });
    tarjetasService.findOne.mockResolvedValue({
      id: "card-1",
      usuarioId: "user-2",
    });

    await expect(
      service.create({
        usuarioId: "user-1",
        tarjetaId: "card-1",
        monto: 100,
      } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("throws ServiceUnavailableException on fetch timeout", async () => {
    usuariosService.findOne.mockResolvedValue({ id: "user-1" });
    tarjetasService.findOne.mockResolvedValue({
      id: "card-1",
      usuarioId: "user-1",
    });

    global.fetch = jest.fn().mockRejectedValue({ name: "AbortError" }) as any;

    await expect(
      service.create({
        usuarioId: "user-1",
        tarjetaId: "card-1",
        monto: 100,
      } as any),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("throws BadGatewayException when python service responds with non-ok status", async () => {
    usuariosService.findOne.mockResolvedValue({ id: "user-1" });
    tarjetasService.findOne.mockResolvedValue({
      id: "card-1",
      usuarioId: "user-1",
    });

    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500 }) as any;

    await expect(
      service.create({
        usuarioId: "user-1",
        tarjetaId: "card-1",
        monto: 100,
      } as any),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it("throws InternalServerErrorException when db insert fails after processing payment", async () => {
    usuariosService.findOne.mockResolvedValue({ id: "user-1" });
    tarjetasService.findOne.mockResolvedValue({
      id: "card-1",
      usuarioId: "user-1",
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        aprobado: true,
        estado: "aprobado",
        referencia: "REF-999",
      }),
    } as any);

    const returning = jest.fn().mockRejectedValue(new Error("db failed"));
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    await expect(
      service.create({
        usuarioId: "user-1",
        tarjetaId: "card-1",
        monto: 100,
      } as any),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
