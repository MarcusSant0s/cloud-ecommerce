import { InstitutionalPage, Section, p, WhatsAppLink } from "@/components/InstitutionalPage";

export const metadata = {
  title: "Cuidados com a Peça",
  description:
    "Como preservar o banho das suas semijoias e manter o brilho por muito mais tempo.",
};

export default function CuidadosPage() {
  return (
    <InstitutionalPage
      title="Cuidados com a Peça"
      intro="Semijoia dura pelo cuidado, não pela sorte. O banho é uma camada fina de metal nobre, e quase tudo que o desgasta é evitável."
    >
      <Section title="A regra que resolve a maior parte">
        <p className={p}>
          <strong className="font-medium text-foreground">
            Última a colocar, primeira a tirar.
          </strong>{" "}
          Perfume, hidratante, protetor solar e spray de cabelo atacam o banho
          antes de qualquer outra coisa. Vista-se, finalize a pele e o cabelo, e
          só então coloque a peça — e tire antes de começar a se despir.
        </p>
      </Section>

      <Section title="Água e suor">
        <p className={p}>
          Tire a peça para tomar banho, lavar louça, entrar no mar ou na piscina.
          Cloro e água salgada são os piores casos: podem manchar o banho em uma
          única exposição. Suor também oxida com o tempo, então evite usar em
          treino.
        </p>
      </Section>

      <Section title="Guardar">
        <p className={p}>
          Guarde cada peça separada, em saquinho individual ou em compartimentos
          do porta-joias. Peças soltas juntas se riscam umas às outras, e risco no
          banho não tem conserto. Prefira lugar seco — umidade de banheiro acelera
          a oxidação mesmo com a peça guardada.
        </p>
      </Section>

      <Section title="Limpar">
        <p className={p}>
          Flanela seca e macia, com movimento leve. Nada de pasta de dente,
          álcool, água sanitária, removedor ou escova — todos removem o banho
          junto com a sujeira. Se a peça tiver pedra, limpe só o metal em volta.
        </p>
      </Section>

      <Section title="Se mesmo assim escurecer">
        <p className={p}>
          Escurecimento precoce em uso normal é caso de garantia, não de faxina.
          Antes de tentar recuperar em casa — o que costuma piorar — vale{" "}
          <WhatsAppLink>nos chamar no WhatsApp</WhatsAppLink> com uma foto da peça.
        </p>
      </Section>
    </InstitutionalPage>
  );
}
