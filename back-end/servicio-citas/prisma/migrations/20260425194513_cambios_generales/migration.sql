/*
  Warnings:

  - You are about to drop the column `empleada_id` on the `citas` table. All the data in the column will be lost.
  - Added the required column `empleado_id` to the `citas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "citas" DROP COLUMN "empleada_id",
ADD COLUMN     "empleado_id" TEXT NOT NULL;
