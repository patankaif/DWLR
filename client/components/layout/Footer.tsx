export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} DWLR. All rights reserved.</p>
          <p className="opacity-80">Made for monitoring seasonal water insights.</p>
        </div>
      </div>
    </footer>
  );
}
