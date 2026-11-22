import { ShieldCheck, Users, Zap } from "lucide-react";
import { CreateRoomForm } from "@/components/create-room/CreateRoomForm";
import { GithubIcon, LinkedinIcon } from "@/components/layout/BrandIcons";
import { Header, PORTFOLIO_URL } from "@/components/layout/Header";

const HIGHLIGHTS = [
  { icon: Zap, title: "Tempo real", text: "Votos e revelação sincronizados na hora." },
  { icon: Users, title: "Sem cadastro", text: "Crie a sala e compartilhe o link." },
  { icon: ShieldCheck, title: "Privado", text: "Votos ficam só no navegador até revelar." },
];

export default function Home() {
  return (
    <div className="bg-sky flex min-h-screen flex-1 flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">
        <div className="flex max-w-xl flex-col items-center gap-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="size-1.5 rounded-full bg-success" />
            Gratuito e de código aberto
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-balance text-navy sm:text-5xl">
            Estimem juntos, <span className="text-primary">sem travar a sprint.</span>
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Planning Poker simples e em tempo real para times ágeis. Crie uma sala,
            mande o link e decidam em minutos.
          </p>
        </div>

        <div className="w-full max-w-lg rounded-lg border border-border bg-card p-7 shadow-[0_2px_2px_rgba(0,0,0,0.1),0_16px_48px_rgba(3,45,96,0.12)]">
          <CreateRoomForm />
        </div>

        <ul className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-2.5 rounded-lg border border-border bg-card/80 p-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-xs">
                <span className="block font-semibold text-foreground">{title}</span>
                <span className="text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </main>

      <footer className="flex flex-col items-center gap-2 px-4 pb-8 text-center text-xs text-muted-foreground">
        <p>
          Feito por{" "}
          <a href={PORTFOLIO_URL} className="font-semibold text-primary hover:underline">
            Pedro Ferreira
          </a>{" "}
          · Desenvolvedor Salesforce
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://linkedin.com/in/pferreiravkt"
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn de Pedro Ferreira"
            className="rounded-md p-1 transition-colors hover:text-primary"
          >
            <LinkedinIcon className="size-4" />
          </a>
          <a
            href="https://github.com/PedFerreira/salesforce-portfolio/tree/main/poker-app"
            target="_blank"
            rel="noopener"
            aria-label="Código-fonte no GitHub"
            className="rounded-md p-1 transition-colors hover:text-primary"
          >
            <GithubIcon className="size-4" />
          </a>
        </div>
      </footer>
    </div>
  );
}
