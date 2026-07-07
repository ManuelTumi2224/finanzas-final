import { requireUser } from "@/lib/auth";
import { VehiculoForm } from "./VehiculoForm";

export default async function NuevoVehiculoPage() {
  await requireUser();
  return <VehiculoForm />;
}
