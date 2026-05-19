/*
  Warnings:

  - You are about to drop the column `publidId` on the `servicio_fotos` table. All the data in the column will be lost.
  - Added the required column `publicId` to the `servicio_fotos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "servicio_fotos" DROP COLUMN "publidId",
ADD COLUMN     "publicId" TEXT NOT NULL;
