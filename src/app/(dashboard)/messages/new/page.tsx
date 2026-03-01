import { redirect } from "next/navigation";

// The old /messages/new compose page is replaced by the inline New Chat dialog.
export default function Page() {
    redirect("/messages");
}