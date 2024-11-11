/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `Worker` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Submission_amount_key";

-- CreateIndex
CREATE UNIQUE INDEX "Worker_address_key" ON "Worker"("address");
