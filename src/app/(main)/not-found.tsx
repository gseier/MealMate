export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
        404 - Page Not Found
      </div>
      <h1 className="text-4xl font-bold tracking-tight">
        Oops! We could not find that page.
      </h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for does not exist or may have been moved.
      </p>
      <a
        href="/"
        className="mt-4 inline-block rounded-lg bg-primary px-5 py-2 text-white transition hover:bg-primary/90"
      >
        Go back home
      </a>
    </main>
  );
}
