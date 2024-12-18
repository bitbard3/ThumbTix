"use client";
import withAuth from "@/components/hoc/withAuth";
import { TaskForm } from "@/components/TaskForm";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";
import React from "react";

const Task = () => {
  return (
    <div className="bg-black min-h-screen w-screen overflow-hidden">
      <StaggeredBlurIn staggerDelay={0.3} duration={0.8}>
        <div className="main__container w-full">
          <div className="flex flex-col w-full min-h-screen pt-[120px] inner__container">
            <p className="text-white text-3xl font-medium pb-10 text-center">
              Create a task
            </p>
            <div className="mx-auto">
              <TaskForm />
            </div>
          </div>
        </div>
      </StaggeredBlurIn>
    </div>
  );
};
export default withAuth(Task);
