import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <p className="mb-2 text-5xl font-semibold text-pink-500">404</p>
      <p className="mb-6 text-gray-500">Trang bạn tìm không tồn tại.</p>
      <Link href="/" className="font-medium text-pink-500 hover:text-pink-600">
        Quay về trang chủ
      </Link>
    </div>
  );
}
