/*
  Warnings:

  - You are about to drop the column `optinoId` on the `Submission` table. All the data in the column will be lost.
  - Changed the type of `pendingAmount` on the `Balance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `lockedAmount` on the `Balance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `optionId` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `amount` on the `Submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `amount` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_optinoId_fkey";

-- AlterTable
ALTER TABLE "Balance" DROP COLUMN "pendingAmount",
ADD COLUMN     "pendingAmount" BIGINT NOT NULL,
DROP COLUMN "lockedAmount",
ADD COLUMN     "lockedAmount" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "optinoId",
ADD COLUMN     "optionId" INTEGER NOT NULL,
DROP COLUMN "amount",
ADD COLUMN     "amount" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "amount",
ADD COLUMN     "amount" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
