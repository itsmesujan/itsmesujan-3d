import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid-paper flex min-h-[100svh] items-center bg-paper">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <p className="t-mono mb-4 text-ink/55">404</p>
        <h1 className="t-display">Nothing shipped here.</h1>
        <p className="t-body-lg mx-auto t-measure mt-6 text-ink/70">
          That page doesn&apos;t exist — yet. Everything that has shipped is on
          the way back.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the portfolio
          </Link>
          <Link href="/#work" className="btn">
            See the work
          </Link>
        </div>
      </div>
    </main>
  );
}
