import { supabase } from "@/lib/supabase";

export async function GET() {
  await supabase.from("wishes").select("id").limit(1);
  return Response.json({ ok: true, time: new Date().toISOString() });
}
