"use client";
import withAuth from "@/components/hoc/withAuth";
import { Badge } from "@/components/ui/badge";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type OptionType = {
  imageUrl: string;
  _count: {
    submissions: number;
  };
};

export type UserTaskType = {
  id: number;
  title: string;
  amount: string;
  done: boolean;
  options: OptionType[];
};

const UserTask = () => {
  const [tasks, setTasks] = useState<UserTaskType[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getTask = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/task`, {
          headers: {
            Authorization:
              typeof window !== "undefined"
                ? localStorage.getItem("token")
                : null,
          },
        });
        setTasks(res.data.tasks);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load task", {
          classNames: {
            toast: "toast-error",
          },
        });
      } finally {
        setLoading(false);
      }
    };
    getTask();
  }, []);
  if (tasks == null || loading) {
    return (
      <div className="h-screen flex justify-center flex-col">
        <div className="w-full flex justify-center text-2xl">Loading...</div>
      </div>
    );
  }
  return (
    <div className="bg-black min-h-screen w-screen overflow-hidden">
      <StaggeredBlurIn staggerDelay={0.3} duration={0.8}>
        <div className="main__container w-full">
          <div className="flex flex-col w-full min-h-screen pt-[120px] inner__container">
            <p className="text-white text-3xl font-medium pb-10">Your tasks</p>
            {tasks.map((task) => (
              <div
                key={task.id}
                className="w-full rounded-lg mb-8 p-4 bg-gray-800"
              >
                <p className="text-white text-xl">{task.title}</p>
                <div className="flex mt-3 space-x-2">
                  <Badge variant={`${task.done ? `success` : `warning`}`}>
                    {task.done ? `Done` : `Work in progress`}
                  </Badge>
                  <Badge className="bg-neutral-900" variant={"secondary"}>
                    {Number(task.amount) / 1000000000} SOL
                  </Badge>
                </div>
                <div className="flex w-full justify-center mt-5 flex-wrap gap-y-10  gap-x-[5.29%]">
                  {task.options.map((option) => (
                    <div
                      key={option.imageUrl}
                      className="lg:w-[28%] w-full rounded-lg bg-slate-600 justify-between flex flex-col items-center space-y-2 p-5"
                    >
                      <Image
                        className="w-full h-auto"
                        src={option.imageUrl}
                        alt="Image option"
                        layout="responsive"
                        width={16}
                        height={9}
                      />

                      <p className="text-white font-medium pt-4">
                        {option._count.submissions} Votes
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </StaggeredBlurIn>
    </div>
  );
};
export default withAuth(UserTask);
