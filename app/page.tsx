import { auth } from "@/auth";
import { logoutUser } from "@/app/actions/auth";
import { createDocument, deleteDocument } from "@/app/actions/document";
import { connectDB } from "@/lib/mongoose";
import { redirect } from "next/navigation";
import { AppDocument, IDocument } from "@/models/Document";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (!isLoggedIn) {
    redirect("/login");
  }

  let documents: IDocument[] = [];
  try {
    await connectDB();
    documents = await AppDocument.find({})
      .sort({ createdAt: -1 })
      .lean();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database error:", error);
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans dark:bg-black">
      <header className="w-full border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-black dark:text-white">
            Local-First
          </h1>
          <nav>
            <form action={logoutUser}>
              <button
                type="submit"
                className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
              >
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-12 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-black dark:text-white">
            Welcome back, {session?.user?.name || "User"}!
          </h2>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            You are securely logged into your local-first environment. You can now start creating and collaborating on documents.
          </p>
          <div className="flex flex-col items-center gap-4 w-full">
            <form action={createDocument} className="flex w-full max-w-sm gap-2">
              <input
                type="text"
                name="title"
                placeholder="Document Title"
                required
                className="flex-1 rounded-xl border border-zinc-300 px-4 py-2 text-sm text-black focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-black px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Create
              </button>
            </form>
          </div>

          {documents.length > 0 && (
            <div className="mt-12 w-full text-left">
              <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Your Documents</h3>
              <div className="flex flex-col gap-3">
                {documents.map((doc: IDocument) => (
                  <div key={String(doc._id)} className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
                    <Link href={`/notes/${String(doc._id)}`} className="flex-1 font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400 transition-colors">
                      {String(doc.title)}
                    </Link>
                    <form action={deleteDocument}>
                      <input type="hidden" name="documentId" value={String(doc._id)} />
                      <button
                        type="submit"
                        className="ml-4 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
