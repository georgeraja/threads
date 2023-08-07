//Importing ClearProvider so we can wrap authenication layout within it
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";

//for SEO
export const metadata = {
  title: "Threads",
  description: "A Next.js 13 Meta Thread Application",
};

//rendering font in next-js
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      {
        <html lang="en">
          <body className={`${inter.className} bg-dark-1`}>{children}</body>
        </html>
      }
    </ClerkProvider>
  );
}
