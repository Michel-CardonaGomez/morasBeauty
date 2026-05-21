/*
  Warnings:

  - You are about to drop the `empleada_servicio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `horarios_empleada` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "empleada_servicio" DROP CONSTRAINT "empleada_servicio_empleada_id_fkey";

-- DropForeignKey
ALTER TABLE "horarios_empleada" DROP CONSTRAINT "horarios_empleada_empleada_id_fkey";

-- DropTable
DROP TABLE "empleada_servicio";

-- DropTable
DROP TABLE "horarios_empleada";

-- CreateTable
CREATE TABLE "horarios_empleado" (
    "id" TEXT NOT NULL,
    "empleado_id" TEXT NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,

    CONSTRAINT "horarios_empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleado_servicio" (
    "empleado_id" TEXT NOT NULL,
    "servicio_id" TEXT NOT NULL,

    CONSTRAINT "empleado_servicio_pkey" PRIMARY KEY ("empleado_id","servicio_id")
);

-- AddForeignKey
ALTER TABLE "horarios_empleado" ADD CONSTRAINT "horarios_empleado_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleado_servicio" ADD CONSTRAINT "empleado_servicio_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
