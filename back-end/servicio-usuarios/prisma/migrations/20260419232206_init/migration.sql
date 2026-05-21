-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('cliente', 'empleado', 'admin');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'cliente',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_empleada" (
    "id" TEXT NOT NULL,
    "empleada_id" TEXT NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,

    CONSTRAINT "horarios_empleada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleada_servicio" (
    "empleada_id" TEXT NOT NULL,
    "servicio_id" TEXT NOT NULL,

    CONSTRAINT "empleada_servicio_pkey" PRIMARY KEY ("empleada_id","servicio_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "horarios_empleada" ADD CONSTRAINT "horarios_empleada_empleada_id_fkey" FOREIGN KEY ("empleada_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleada_servicio" ADD CONSTRAINT "empleada_servicio_empleada_id_fkey" FOREIGN KEY ("empleada_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
