import CTAButton from "@/components/CTAButton";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";

export default function Home() {
  return (
    <div className="bg-black z-0 relative min-h-screen w-screen overflow-hidden">
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
            <CTAButton />
          </div>
        </div>
      </StaggeredBlurIn>
    </div>
  );
}
