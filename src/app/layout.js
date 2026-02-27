import "./globals.css";

export const metadata = {
  title: {
    template: "%s | flower-shop",
    default: "flower-shop",
  },
};

export default function AppLayout({ children }) {
  return (
    <html lang="vi">
      <body className="flex flex-col max-w-6xl min-h-screen px-4 py-6 mx-auto text-gray-800 bg-pink-100 sm:px-6 sm:py-8 lg:px-8">{children}</body>
    </html>
  );
}
