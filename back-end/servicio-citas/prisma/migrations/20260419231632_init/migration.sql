-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('pendiente', 'completada', 'cancelada');

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "empleada_id" TEXT NOT NULL,
    "servicio_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'pendiente',
    "notas" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);
