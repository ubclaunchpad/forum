import { redirect } from "next/navigation";

export default function Page() {
  redirect("/forum/admin");

  return <></>;
}
