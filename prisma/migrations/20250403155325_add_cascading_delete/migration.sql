-- DropForeignKey
ALTER TABLE "FoodOnPost" DROP CONSTRAINT "FoodOnPost_postId_fkey";

-- AddForeignKey
ALTER TABLE "FoodOnPost" ADD CONSTRAINT "FoodOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
