"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-24 px-6 py-12 md:px-8 lg:py-20">
        {/* HERO */}
        <motion.section
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.12 }}
          className="mt-2 grid gap-12 md:mt-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center"
        >
          {/* Coluna esquerda */}
          <motion.div variants={fadeUp} className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
              <span>Sua chance que não acaba • Jogue pra sempre</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                Seu passe da sorte
                <br />
                <span className="text-emerald-300">que não expira.</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
                Com o Sorte Sempre, você compra seu passe uma vez só e concorre
                pra sempre. É isso mesmo: sem mensalidade, sem pegadinha e sem
                letrinha miúda.
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-7 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_26px_rgba(74,222,128,0.6)] transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
                >
                  Garantir meu passe
                </Link>
              </motion.div>
              <p className="text-xs md:text-sm text-slate-400">
                Acompanhe seus números e os sorteios direto no seu painel.
              </p>
            </div>
          </motion.div>

          {/* Coluna direita – card institucional */}
          <motion.div variants={fadeUp} className="h-full">
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="flex h-full flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900 px-7 py-7 text-sm shadow-[0_22px_60px_rgba(0,0,0,0.85)]"
            >
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
                  A boa do Sorte Sempre
                </p>
                 <h2 className="mt-5 text-xl font-bold text-slate-50">
                  Um passe, chances infinitas.
                </h2>
                 <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  A ideia é simples: você pega seu passe digital e já tá dentro
                  de todos os sorteios que rolam aqui. Sem precisar comprar de
                  novo, é só torcer.
                </p>
              </div>

              <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Passe da Sorte
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-50">
                      R$ 100,00 • Chance vitalícia
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3.5 py-1.5 text-[11px] font-medium text-slate-200">
                    Compra única
                  </span>
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] text-slate-500">
                Dá uma olhada nas regras antes de fazer sua fezinha.
              </p>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* SEÇÃO: Sobre / Propósito */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="space-y-3 max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500">
              Qual é a boa?
            </p>
             <h2 className="text-xl font-bold text-slate-50 md:text-2xl">
              Um jeito novo de apostar na sorte, sem complicação.
            </h2>
             <p className="text-base leading-relaxed text-slate-400">
              Chega de ficar comprando jogo toda semana. Aqui, você garante seu
              passe uma vez e ele vale pra sempre. Fica tudo organizado no seu painel,
              sem estresse.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid gap-6 md:grid-cols-2 md:gap-8"
          >
            {[
              {
                titulo: "Pagou uma vez, valeu!",
                texto:
                  "É isso: uma única compra e seu passe tá na roda pra sempre, valendo em todos os sorteios.",
              },
              {
                titulo: "Tudo no automático",
                texto:
                  "Os sorteios rolam de forma automática e transparente. Se ganhar, a gente te avisa.",
              },
              {
                titulo: "Direto e reto",
                texto:
                  "Sem complicação de vários jogos ou planos. É um passe, uma regra, e muita chance de ganhar.",
              },
              {
                titulo: "Tudo na sua mão",
                texto:
                  "Seus passes, os resultados, o calendário... Tudo o que importa tá no seu painel, fácil de achar.",
              },
            ].map((item) => (
              <motion.div
                key={item.titulo}
                variants={fadeUp}
                className="flex h-full flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-slate-800/50"
              >
                <h3 className="text-base font-semibold text-slate-50">
                  {item.titulo}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {item.texto}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* SEÇÃO: Como funciona na prática */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500">
              Beleza, como eu entro?
            </p>
            <h2 className="text-xl font-semibold text-slate-50 md:text-2xl">
              É moleza! Só 3 passos pra começar a concorrer.
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid gap-6 md:grid-cols-3 md:gap-8"
          >
            {[
              {
                numero: "1",
                titulo: "Garanta seu passe",
                texto:
                  "Escolha seu passe da sorte, faça o pagamento e pronto, você já tá no jogo.",
              },
              {
                numero: "2",
                titulo: "Fique de olho no painel",
                texto:
                  "Com seu login, você acessa seu painel pra ver seus passes, os resultados e quando rolam os próximos sorteios.",
              },
              {
                numero: "3",
                titulo: "É só torcer!",
                texto:
                  "Seu passe já tá valendo. Os sorteios acontecem sempre e a gente avisa tudo pelo seu painel. Boa sorte!",
              },
            ].map((step) => (
              <motion.div
                key={step.numero}
                variants={fadeUp}
                className="flex h-full flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-slate-800/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-100">
                  {step.numero}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-50">
                    {step.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {step.texto}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* SEÇÃO: Benefícios da mecânica */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500">
              E qual a vantagem?
            </p>
            <h2 className="text-xl font-semibold text-slate-50 md:text-2xl">
              As vantagens de ter um passe que não vence.
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid gap-6 md:grid-cols-2 md:gap-8"
          >
            {[
              {
                titulo: "Sempre na disputa",
                texto:
                  "Comprou uma vez, tá valendo. Seu passe continua ativo, sem precisar gastar mais grana com isso.",
              },
              {
                titulo: "Tudo num só lugar",
                texto:
                  "Seus passes, agenda de sorteios e todos os avisos importantes ficam organizados no seu painel. Sem bagunça.",
              },
              {
                titulo: "Papo reto",
                texto:
                  "A gente manda a real. As regras são claras, os avisos são diretos e fica tudo registrado pra você conferir.",
              },
              {
                titulo: "Feito pra durar",
                texto:
                  "O sistema foi criado pra rodar por muito tempo, mantendo a base de jogadores e a sua chance de ganhar sempre ativa.",
              },
            ].map((benefit) => (
              <motion.div
                key={benefit.titulo}
                variants={fadeUp}
                className="flex h-full flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-slate-800/50"
              >
                <h3 className="text-base font-semibold text-slate-50">
                  {benefit.titulo}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {benefit.texto}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* SEÇÃO: Segurança e transparência */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500">
              É seguro? Pode confiar?
            </p>
            <h2 className="text-xl font-semibold text-slate-50 md:text-2xl">
              Jogada limpa do começo ao fim.
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid gap-6 md:grid-cols-2 md:gap-8"
          >
            <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-slate-800/50">
              <h3 className="text-base font-semibold text-slate-50">Regras do Jogo</h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Todas as regras do jogo ficam disponíveis pra você ler e
                concordar antes de entrar. Qualquer mudança importante, a gente
                avisa no seu painel.
              </p>
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-slate-800/50">
              <h3 className="text-base font-semibold text-slate-50">
                Seus dados e seu painel
              </h3>
              <p className="text-sm leading-relaxed text-slate-300">
                Seu acesso ao painel é só seu, protegido com login e senha. A
                gente mantém tudo organizado pra você acompanhar seus passes e
                sua participação.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* SEÇÃO: Para quem é */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500">
              Será que é pra mim?
            </p>
            <h2 className="text-xl font-semibold text-slate-50 md:text-2xl">
              O perfil da galera que já tá no Sorte Sempre.
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="grid gap-6 md:grid-cols-3 md:gap-8"
          >
            {[
              {
                titulo: "Pra quem quer moleza",
                texto:
                  "A galera que prefere resolver tudo de uma vez, sem a chatice de ficar comprando toda hora.",
              },
              {
                titulo: "Pra quem é organizado",
                texto:
                  "Quem gosta de ter tudo na mão, num lugar só, pra conferir os passes e os resultados sem dor de cabeça.",
              },
              {
                titulo: "Pra quem gosta do papo reto",
                texto:
                  "A turma que curte regra clara, sem enrolação e com tudo explicado de um jeito fácil de entender.",
              },
            ].map((perfil) => (
              <motion.div
                key={perfil.titulo}
                variants={fadeUp}
                className="flex h-full flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-6 py-6 text-base transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-slate-800/50"
              >
                <h3 className="text-base font-semibold text-slate-50">
                  {perfil.titulo}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300">
                  {perfil.texto}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* SEÇÃO: FAQ */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
          className="space-y-10"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500">
              Perguntas frequentes
            </p>
            <h2 className="text-xl font-semibold text-slate-50 md:text-2xl">
              Dúvidas comuns sobre o funcionamento.
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="space-y-5 text-base md:space-y-6"
          >
            {[
              {
                pergunta: "Vou precisar comprar de novo depois?",
                resposta:
                  "Não! A mágica do Sorte Sempre é essa: você compra o passe uma vez só e ele já vale pra sempre, conforme as regras.",
              },
              {
                pergunta: "Como eu sei se ganhei?",
                resposta:
                  "É tudo pelo seu painel. Lá você vê seus passes, os resultados e fica por dentro de tudo o que tá rolando.",
              },
              {
                pergunta: "Tem mais de um tipo de passe?",
                resposta:
                  "Sim, a gente pode ter o passe principal e outras opções com vantagens diferentes. Fica tudo explicado na hora de comprar.",
              },
              {
                pergunta: "Onde eu leio as regras completas?",
                resposta:
                  "As regras do jogo ficam sempre disponíveis pra você consultar no seu painel, a qualquer hora.",
              },
            ].map((item) => (
              <div
                key={item.pergunta}
                className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-6 transition-all duration-300 hover:border-emerald-400/50 hover:bg-slate-800/50"
              >
                <h3 className="text-base font-semibold text-slate-50">
                  {item.pergunta}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {item.resposta}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* SEÇÃO FINAL: Call-to-action */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.08 }}
          className="space-y-8 pb-12 text-center"
        >
          <motion.div variants={fadeUp} className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-500">
              E aí, bora?
            </p>
            <h2 className="text-xl font-semibold text-slate-50 md:text-2xl">
              Crie sua conta, conheça o painel e faça sua sorte.
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              O Sorte Sempre tá sempre melhorando. A gente vai atualizando com
              novidades pra deixar sua experiência cada vez mais top. A ideia é
              ser um jogo justo, organizado e fácil pra todo mundo.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex justify-center gap-4 pt-2"
          >
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-7 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_26px_rgba(74,222,128,0.6)] transition-colors hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
            >
              Quero começar a jogar
            </Link>
          </motion.div>
        </motion.section>

        {/* Rodapé */}
        <footer className="border-t border-slate-800 py-6 text-center text-[11px] text-slate-500">
          Sorte Sempre — Plataforma em desenvolvimento. O conteúdo desta página
          é apenas para apresentação. Antes de jogar, consulte sempre as regras
          oficiais.
        </footer>
      </div>
    </main>
  );
}
