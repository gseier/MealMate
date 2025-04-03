/*
  Warnings:

  - Made the column `day` on table `bookmarks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "bookmarks" ALTER COLUMN "day" SET NOT NULL;
