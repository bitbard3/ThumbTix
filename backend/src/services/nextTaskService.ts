import prisma from "../../prisma/db";

export const nextTaskService = async (userId: string) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        done: false,
        submissions: {
          none: {
            workerId: Number(userId),
          },
        },
      },
      select: {
        id: true,
        amount: true,
        title: true,
        options: true,
      },
    });

    return { ...task, amount: task?.amount.toString() };
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong");
  }
};
