import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navItem = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <NavLink to="/" end className={({ isActive }) => cn("px-2 py-1 text-sm font-medium transition-colors", isActive ? "text-primary" : "text-foreground/70 hover:text-foreground")}>Home</NavLink>
      <NavLink to="/location" className={({ isActive }) => cn("px-2 py-1 text-sm font-medium transition-colors", isActive ? "text-primary" : "text-foreground/70 hover:text-foreground")}>Location</NavLink>
      <NavLink to="/alert" className={({ isActive }) => cn("px-2 py-1 text-sm font-medium transition-colors", isActive ? "text-primary" : "text-foreground/70 hover:text-foreground")}>Alert</NavLink>
      <NavLink to="/precautions" className={({ isActive }) => cn("px-2 py-1 text-sm font-medium transition-colors", isActive ? "text-primary" : "text-foreground/70 hover:text-foreground")}>Precautions</NavLink>
      <NavLink to="/ai" className={({ isActive }) => cn("px-2 py-1 text-sm font-medium transition-colors", isActive ? "text-primary" : "text-foreground/70 hover:text-foreground")}>AI</NavLink>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-primary">DWLR</span>
        </Link>
        <nav className="hidden sm:block">{navItem}</nav>
        <button aria-label="Toggle menu" className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-md border text-foreground/80" onClick={() => setOpen((v) => !v)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="border-t px-4 pb-4 sm:hidden">
          {navItem}
        </div>
      )}
    </header>
  );
}
