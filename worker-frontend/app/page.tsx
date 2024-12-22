import CTAButton from "@/components/CTAButton";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="bg-black min-h-screen w-screen overflow-hidden">
        <StaggeredBlurIn staggerDelay={0.3} duration={0.8}>
          <div className="main__container w-full min-h-screen flex flex-col">
            <div className="flex flex-col w-full flex-grow items-center justify-center inner__container">
              <p className="text-white text-5xl lg:text-7xl font-[600] text-center">
                Earn by analysing images
              </p>
              <p className="text-gray-400 text-lg lg:text-xl mt-6 text-center lg:max-w-[60%]">
                Earn Solana by choosing the best images, simple, fun, rewarding!
              </p>
              <CTAButton />
            </div>
            <div className="mt-auto py-8 flex border-t w-full items-center">
              <p className="text-white">
                Create your own{" "}
                <Link
                  target="_blank"
                  href={"https://thumb-tix-user.vercel.app/"}
                >
                  <span className="font-medium border-b border-neutral-200">
                    Task
                  </span>{" "}
                </Link>
              </p>
            </div>
          </div>
        </StaggeredBlurIn>
      </div>
    </>
  );
}
