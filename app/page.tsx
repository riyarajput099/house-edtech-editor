import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 text-center">
        <h1 className="max-w-xl text-5xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50 mb-6">
          Collaborative Editor
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 mb-10">
          Create, edit, and share documents in real-time with your team. Get started today.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row w-full justify-center max-w-sm mx-auto">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full sm:w-auto px-8")}
          >
            Login
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto px-8")}
          >
            Register
          </Link>
        </div>
      </main>
    </div>
  );
}
