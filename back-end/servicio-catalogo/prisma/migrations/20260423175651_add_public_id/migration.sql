/*
  Warnings:

  - Added the required column `publidId` to the `servicio_fotos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "servicio_fotos" ADD COLUMN     "publidId" TEXT NOT NULL;
