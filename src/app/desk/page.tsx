import type { Metadata } from "next";
import { DeskBoard } from "@/components/desk-board";

export const metadata: Metadata = { title: "Desk" };

export default function DeskPage() {
  return <DeskBoard />;
}
