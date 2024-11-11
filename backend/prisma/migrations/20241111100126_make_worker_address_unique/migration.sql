/*
  Warnings:

  - A unique constraint covering the columns `[amount]` on the table `Submission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Submission_amount_key" ON "Submission"("amount");
