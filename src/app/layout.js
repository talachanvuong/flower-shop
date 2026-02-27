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
      <body>{children}</body>
    </html>
  );
}
