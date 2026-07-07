import { requireUser } from "@/lib/auth";
import { ClienteForm } from "./ClienteForm";

export default async function NuevoClientePage() {
  await requireUser();
  return <ClienteForm />;
}
