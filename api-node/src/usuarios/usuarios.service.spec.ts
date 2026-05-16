import { ConflictException, NotFoundException } from "@nestjs/common";

import { UsuariosService } from "./usuarios.service";

describe("UsuariosService", () => {
  let service: UsuariosService;
  let db: any;

  beforeEach(() => {
    db = {
      insert: jest.fn(),
      select: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new UsuariosService(db);
  });

  it("creates a user successfully", async () => {
    const dto = {
      nombre: "Carlos",
      apellido: "García",
      email: "carlos@email.com",
      telefono: "+52 55 1234 5678",
    };
    const createdUser = { id: "user-1", ...dto };
    const returning = jest.fn().mockResolvedValue([createdUser]);
    const values = jest.fn().mockReturnValue({ returning });

    db.insert.mockReturnValue({ values });

    await expect(service.create(dto as any)).resolves.toEqual(createdUser);
    expect(db.insert).toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(dto);
  });

  it("throws ConflictException when postgres returns unique violation on create", async () => {
    const dto = {
      nombre: "Carlos",
      apellido: "García",
      email: "carlos@email.com",
    };
    const returning = jest.fn().mockRejectedValue({ code: "23505" });
    const values = jest.fn().mockReturnValue({ returning });

    db.insert.mockReturnValue({ values });

    await expect(service.create(dto as any)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("throws NotFoundException when findOne does not find the user", async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });

    db.select.mockReturnValue({ from });

    await expect(service.findOne("missing-id")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws ConflictException when updating to an email that already exists", async () => {
    const currentUser = { id: "user-1", email: "old@email.com" };
    jest.spyOn(service, "findOne").mockResolvedValue(currentUser as any);

    const duplicateLimit = jest.fn().mockResolvedValue([{ id: "user-2" }]);
    const duplicateWhere = jest.fn().mockReturnValue({ limit: duplicateLimit });
    const duplicateFrom = jest.fn().mockReturnValue({ where: duplicateWhere });

    db.select.mockReturnValue({ from: duplicateFrom });

    await expect(
      service.update("user-1", { email: "new@email.com" } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
