import Link from "next/link";

export default function NotFound() {
  /*
   * The one page that uses the "void" treatment: a 404 is an absence, so it
   * gets the dark grid and scanlines the rest of the site keeps on paper.
   */
  return (
    <main className="grid-void scanlines relative flex min-h-[100svh] items-center overflow-hidden bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <p className="t-mono mb-4 text-paper/50">404</p>
        <h1 className="t-display">Nothing shipped here.</h1>
        <p className="t-body-lg t-measure mx-auto mt-6 text-paper/72">
          That page doesn&apos;t exist — yet. Everything that has shipped is on
          the way back.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Back to the portfolio
          </Link>
          <Link href="/work" className="btn btn-void">
            See the work
          </Link>
        </div>
      </div>
    </main>
  );
}
