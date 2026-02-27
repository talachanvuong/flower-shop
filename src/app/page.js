import Link from "next/link";

export default function AppPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <p className="mb-8 text-4xl font-semibold text-pink-500 sm:text-5xl">flower-shop</p>

      <div className="flex flex-col gap-3">
        <Link href="/create" className="px-10 py-3 font-medium text-white bg-pink-500 rounded-full hover:bg-pink-600">
          Tạo lời chúc mới
        </Link>

        <Link href="/manage" className="px-10 py-3 font-medium text-pink-500 hover:text-pink-600">
          Quản lý lời chúc
        </Link>
      </div>
    </div>
  );
}
