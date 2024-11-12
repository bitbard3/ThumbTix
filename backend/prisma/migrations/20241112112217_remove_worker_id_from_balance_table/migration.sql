/*
  Warnings:

  - You are about to drop the column `workerId` on the `Balance` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Balance_workerId_key";

-- AlterTable
ALTER TABLE "Balance" DROP COLUMN "workerId";
