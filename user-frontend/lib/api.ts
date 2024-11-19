import axios from "axios";

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

export const getTask = async (): Promise<UserTaskType[]> => {
  const res = await axios.get(`${BACKEND_URL}/api/user/task`, {
    headers: {
      Authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.XscY2TKsALxQ9-SGZfoQsqqsRrylaaabTxjf3wKEVs8",
    },
  });

  if (res.status !== 200) {
    throw new Error("Failed to fetch tasks");
  }

  return res.data.tasks;
};
