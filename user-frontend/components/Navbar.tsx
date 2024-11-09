import React from "react";
import Image from "next/image";
import icon from "../public/icon.svg";

export default function Navbar() {
  return (
    <div className=" absolute top-0 w-full">
      <div className="w-full  main__container">
        <div className="inner__container rounded-md py-2 flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-white font-medium text-lg">ThumbTix</h3>
            <Image
              src={icon}
              alt="Icon image"
              className="size-10 font-bold mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
