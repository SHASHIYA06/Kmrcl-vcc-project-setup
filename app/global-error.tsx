"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="flex h-screen items-center justify-center bg-slate-50">
        <div className="rounded border border-red-200 bg-white p-6 text-center">
          <h1 className="mb-2 text-lg font-semibold text-red-700">Something broke</h1>
          <p className="mb-4 max-w-md text-sm text-slate-600">{error.message}</p>
          <button onClick={reset} className="rounded bg-slate-800 px-4 py-2 text-sm text-white">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
