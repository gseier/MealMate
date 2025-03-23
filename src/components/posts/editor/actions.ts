"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: {
  content: string;
  calories: number;
  foods: { name: string; amount: number }[];
}) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  // Validate post fields (foods are passed as-is)
  const { content, calories } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      calories,
      userId: user.id,
      foods: {
        create: input.foods.map((foodItem) => ({
          amount: foodItem.amount, // stores the grams per post (requires FoodOnPost.amount)
          food: {
            connectOrCreate: {
              where: { name: foodItem.name },
              create: { name: foodItem.name, serving: foodItem.amount },
            },
          },
        })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
