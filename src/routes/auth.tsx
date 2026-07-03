import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { AuthPage } from "@/features/auth/AuthPage";
import { z } from "zod";

const searchSchema = z.object({
  mode: z.enum(["login", "register"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — Ticket Booking" }] }),
  component: () => (
    <Layout showFooter={false}>
      <AuthPage />
    </Layout>
  ),
});
