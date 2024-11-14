import ShinyButton from "@/components/ui/ShinyButton";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";
import { MoveRight } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-black h-screen w-screen overflow-hidden">
      <StaggeredBlurIn staggerDelay={0.3} duration={0.8}>
        <div className="main__container w-full ">
          <div className="flex flex-col w-full min-h-screen items-center justify-center inner__container">
            <p className="text-white text-7xl font-[600] text-center">
              Find Your Winning Images
            </p>
            <p className="text-gray-400 text-xl mt-6 text-center max-w-[60%]">
              Find out which images grab attention and drive clicks. Compare,
              analyze, and boost your{" "}
              <span className="text-white font-bold">CTR</span> effortlessly.
            </p>
            <ShinyButton className="mt-12">
              Get Started{" "}
              <MoveRight
                className="ml-1.5"
                strokeWidth={1}
                color="rgb(255,255,255,90%)"
              />{" "}
            </ShinyButton>
          </div>
        </div>
      </StaggeredBlurIn>
    </div>
  );
}
