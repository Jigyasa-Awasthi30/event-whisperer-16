import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { LandingPage } from "@/features/landing/LandingPage";

export const Route = createFileRoute("/")({
  component: () => (
    <Layout>
      <LandingPage />
    </Layout>
  ),
});
