// Validación de configuración con Joi (si está disponible)
let envConfig: {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  pythonServiceUrl: string;
  isDocker: boolean;
};

try {
  const Joi = require("joi");

  const envConfigSchema = Joi.object({
    NODE_ENV: Joi.string()
      .valid("development", "production", "test")
      .default("development"),
    PORT: Joi.number().default(3000).port(),
    DATABASE_URL: Joi.string()
      .uri()
      .required()
      .description("PostgreSQL database connection string"),
    PYTHON_SERVICE_URL: Joi.string()
      .uri()
      .required()
      .description("URL of the Python payment processing service"),
    DOCKER_ENV: Joi.string()
      .valid("true", "false")
      .optional()
      .description('Set to "true" when running in Docker environment'),
  });

  const { error, value } = envConfigSchema.validate(process.env, {
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    console.error("❌ Error de configuración:", error.message);
    console.warn(
      "⚠️  Usando valores por defecto. Ejecuta `npm install` para instalar dependencias o revise si existe el archivo .env.",
    );
  }

  envConfig = {
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    databaseUrl: value.DATABASE_URL,
    pythonServiceUrl: value.PYTHON_SERVICE_URL,
    isDocker: value.DOCKER_ENV === "true",
  };
} catch (importError) {
  console.warn(
    "⚠️  Joi no está disponible. Usando valores por defecto sin validación.",
  );

  // Valores por defecto sin validación
  envConfig = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    databaseUrl:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/pagos_db",
    pythonServiceUrl: process.env.PYTHON_SERVICE_URL || "http://localhost:8000",
    isDocker: process.env.DOCKER_ENV === "true",
  };
}

export { envConfig };
