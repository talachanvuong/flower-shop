import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import WishClient from "./WishClient";

export default async function WishPage({ params }) {
  const { id } = await params;

  // Thử tìm theo link trước, nếu không có thì tìm theo id
  let { data: wish } = await supabase.from("wishes").select("*").eq("link", id).maybeSingle();

  if (!wish) {
    const { data } = await supabase.from("wishes").select("*").eq("id", id).maybeSingle();
    wish = data;
  }

  if (!wish) notFound();

  return <WishClient wish={wish} />;
}
