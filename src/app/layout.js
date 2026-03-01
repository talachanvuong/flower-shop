import { Analytics } from "@vercel/analytics/next";
import { Dancing_Script } from "next/font/google";
import "./globals.css";
import { SupabaseGuard } from "@/app/components/ErrorBoundary";

const dancing = Dancing_Script({
  subsets: ["vietnamese"],
  weight: ["400", "500"],
  variable: "--font-dancing",
});

export const metadata = {
  title: {
    template: "%s | flower-shop",
    default: "flower-shop",
  },
};

export default function AppLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`${dancing.variable} flex flex-col max-w-6xl min-h-screen px-4 py-6 mx-auto text-gray-800 bg-pink-100 sm:px-6 sm:py-8 lg:px-8`}>
        <SupabaseGuard>{children}</SupabaseGuard>
        <Analytics />
      </body>
    </html>
  );
}
