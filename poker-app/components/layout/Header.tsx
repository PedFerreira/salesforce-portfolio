import { Logo } from "@/components/layout/Logo";

export const PORTFOLIO_URL = "https://pedroferreira.site/";

export function Header({ right }: { right?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-40 flex justify-center px-4 py-4">
      <header className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-lg border border-border bg-card/90 px-4 py-2.5 shadow-sm backdrop-blur">
        <Logo />
        {right ?? (
          <a
            href={PORTFOLIO_URL}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            por <span className="font-semibold text-foreground">Pedro Ferreira</span>
          </a>
        )}
      </header>
    </div>
  );
}
