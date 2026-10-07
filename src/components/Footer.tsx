export default function Footer() {
  return (
    <footer className="mt-10 flex items-center justify-between border-t border-white/10 px-15 py-8 text-xs text-white/50">
      <span className="text-sm font-black tracking-wide text-white">
        KINO <span className="text-accent">XII</span>
      </span>
      <span>© {new Date().getFullYear()} Kino XII. All rights reserved.</span>
    </footer>
  );
}