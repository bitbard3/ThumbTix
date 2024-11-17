import React from "react";

export default function Navbar() {
  return (
    <div className=" absolute  top-0 w-full border-b border-neutral-700 border-opacity-70">
      <div className="w-full h-full  main__container">
        <div className="inner__container max-h-[150px] rounded-md py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-white font-medium text-lg">ThumbTix</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
