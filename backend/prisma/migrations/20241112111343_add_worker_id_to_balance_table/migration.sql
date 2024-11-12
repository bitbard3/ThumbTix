/*
  Warnings:

  - A unique constraint covering the columns `[workerId]` on the table `Balance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Balance_workerId_key" ON "Balance"("workerId");
