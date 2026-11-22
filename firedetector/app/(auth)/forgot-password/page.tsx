import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Przypomnienie hasła" };

export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
