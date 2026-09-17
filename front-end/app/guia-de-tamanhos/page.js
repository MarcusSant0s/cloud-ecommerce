import Link from "next/link";
import { InstitutionalPage, Section, p, WhatsAppLink } from "@/components/InstitutionalPage";

export const metadata = {
  title: "Guia de Tamanhos",
  description:
    "Como descobrir seu aro de anel e escolher o comprimento de colar e pulseira.",
};

// Circunferência interna em milímetros por aro — padrão brasileiro.
const RING_SIZES = [
  { aro: 10, mm: 49.3 },
  { aro: 12, mm: 51.9 },
  { aro: 14, mm: 54.4 },
  { aro: 16, mm: 56.9 },
  { aro: 18, mm: 59.5 },
  { aro: 20, mm: 62.0 },
  { aro: 22, mm: 64.6 },
  { aro: 24, mm: 67.1 },
];

const NECKLACE_LENGTHS = [
  { cm: 40, nome: "Choker", onde: "Rente ao pescoço" },
  { cm: 45, nome: "Princesa", onde: "Logo abaixo da clavícula" },
  { cm: 50, nome: "Matinée", onde: "Altura do colo" },
  { cm: 60, nome: "Opera", onde: "Abaixo do busto" },
];

const th = "px-3 py-2 text-left text-[0.65rem] font-medium uppercase tracking-[0.15em] text-muted-foreground";
const td = "px-3 py-2 text-sm text-foreground";

export default function GuiaDeTamanhosPage() {
  return (
    <InstitutionalPage
      title="Guia de Tamanhos"
      intro="Dois minutos aqui evitam uma troca depois. Se ficar entre dois tamanhos, prefira o maior."
    >
      <Section title="Descobrir seu aro">
        <p className={p}>
          Corte uma tira de papel fina ou pegue um barbante, dê uma volta na base
          do dedo — sem apertar, mas sem folga — e marque onde encontra. Estique
          na régua: a medida em milímetros é a circunferência. Procure na tabela.
        </p>
        <p className={p}>
          Meça no fim do dia, quando o dedo está no maior volume, e no dedo em que
          vai usar — a mão dominante costuma ser meio aro maior. Em dia muito frio
          o dedo diminui e a medida engana.
        </p>

        <div className="overflow-x-auto rounded-sm border border-border/60">
          <table className="w-full min-w-[280px]">
            <thead className="bg-muted/40">
              <tr>
                <th className={th}>Aro</th>
                <th className={th}>Circunferência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {RING_SIZES.map(({ aro, mm }) => (
                <tr key={aro}>
                  <td className={`${td} font-medium tabular-nums`}>{aro}</td>
                  <td className={`${td} tabular-nums text-muted-foreground`}>{mm.toFixed(1)} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={p}>
          Já tem um anel que serve? Meça o diâmetro interno dele com a régua e
          multiplique por 3,14 — dá a circunferência.
        </p>
      </Section>

      <Section title="Comprimento de colar">
        <p className={p}>
          O comprimento muda completamente onde a peça descansa. Para saber o seu,
          meça com barbante em volta do pescoço na altura em que gostaria de ver o
          colar cair.
        </p>

        <div className="overflow-x-auto rounded-sm border border-border/60">
          <table className="w-full min-w-[340px]">
            <thead className="bg-muted/40">
              <tr>
                <th className={th}>Comprimento</th>
                <th className={th}>Nome</th>
                <th className={th}>Onde cai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {NECKLACE_LENGTHS.map(({ cm, nome, onde }) => (
                <tr key={cm}>
                  <td className={`${td} font-medium tabular-nums`}>{cm} cm</td>
                  <td className={td}>{nome}</td>
                  <td className={`${td} text-muted-foreground`}>{onde}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Pulseira">
        <p className={p}>
          Meça a circunferência do pulso com barbante e some cerca de 1,5 cm para
          folga confortável. Pulseira apertada demais marca a pele e força o fecho,
          que é onde a peça costuma ceder primeiro.
        </p>
      </Section>

      <Section title="Ainda em dúvida">
        <p className={p}>
          <WhatsAppLink>Chame no WhatsApp</WhatsAppLink> antes de comprar — é mais
          rápido que trocar depois. E se o tamanho não servir,{" "}
          <Link
            href="/trocas"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            a troca está garantida
          </Link>
          .
        </p>
      </Section>
    </InstitutionalPage>
  );
}
