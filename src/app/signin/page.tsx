import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.next ? `?next=${encodeURIComponent(sp.next)}` : "";
  redirect(`/enter${q}`);
}
