"use client";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";
import React, { SyntheticEvent, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
export default function NextTask() {
  interface Option {
    id: number;
    imageUrl: string;
  }

  interface Task {
    amount: string;
    id: number;
    options: Option[];
    title: string;
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selection, setSelection] = useState<Option["id"] | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/nexttask`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        if (!res.data.task.title) {
          return;
        }
        setCurrentTask(res.data.task);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center flex-col">
        <div className="w-full flex justify-center text-2xl">Loading...</div>
      </div>
    );
  }

  if (!loading && !currentTask) {
    return (
      <div className="h-screen flex justify-center flex-col">
        <div className="w-full flex justify-center text-2xl">
          Please check back in some time, there are no pending tasks at the
          moment
        </div>
      </div>
    );
  }
  const onSelectHandler = (e: SyntheticEvent, optionId: number) => {
    e.preventDefault();
    if (optionId == selection) {
      setSelection(null);
    } else {
      setSelection(optionId);
    }
  };
  const onSubmitHandle = async () => {
    if (!selection) {
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/submission`,
        {
          taskId: currentTask?.id,
          optionId: selection,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      if (!res.data.task.title) {
        setCurrentTask(null);
      } else {
        setCurrentTask(res.data.task);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="bg-black min-h-screen w-screen overflow-hidden">
        <StaggeredBlurIn staggerDelay={0.3} duration={0.8}>
          <div className="main__container w-full">
            <div className="flex flex-col items-center w-full min-h-screen pt-[120px] inner__container">
              <div className="mx-auto flex flex-col">
                <p className="text-white text-3xl font-medium pb-10 text-center">
                  {currentTask?.title}
                </p>
                <div className="flex flex-wrap gap-y-10  gap-x-[5.29%] justify-center items-center">
                  {currentTask?.options.map((option) => (
                    <div
                      onClick={(e: SyntheticEvent) =>
                        onSelectHandler(e, option.id)
                      }
                      key={option.id}
                      className={`w-[28%] rounded-lg cursor-pointer bg-slate-600 justify-between flex flex-col items-center space-y-2 p-5 ${
                        option.id === selection
                          ? "outline outline-[12px] outline-[#48BB7879]"
                          : ""
                      }`}
                    >
                      <Image
                        className="w-full h-auto"
                        src={option.imageUrl}
                        alt="Image option"
                        layout="responsive"
                        width={16}
                        height={9}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  disabled={selection == null}
                  className="mx-auto my-8"
                  type="submit"
                  onClick={onSubmitHandle}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </StaggeredBlurIn>
      </div>
    </>
  );
}
