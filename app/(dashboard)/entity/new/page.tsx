import { redirect } from "next/navigation";

export default function EntityNewRedirectPage() {
  redirect("/person/new");
}
