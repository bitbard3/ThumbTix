import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { StaggeredBlurIn } from "@/components/ui/StaggeredBlurIn";

const inter = Inter({
  weight: ["400", "300", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mechanical Thumbs",
  description: "Get CTR with humans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} dark  antialiased`}>
        <StaggeredBlurIn>
          <Navbar />
        </StaggeredBlurIn>
        {children}
      </body>
    </html>
  );
}
