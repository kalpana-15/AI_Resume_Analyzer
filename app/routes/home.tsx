import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import HeroLanding from "~/components/HeroLanding";
import HowItWorks from "~/components/HowItWorks";
import OptimizationDemo from "~/components/OptimizationDemo";
import { Link, useLoaderData, redirect } from "react-router";
import { getUser } from "~/lib/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumify" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/auth");
  }

  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return <main className="min-h-screen relative overflow-hidden font-sans !pt-0">
    <div className="relative z-10">
      <Navbar user={user} />

      <HeroLanding />
      <HowItWorks />
      <OptimizationDemo />


    </div>
  </main>
}