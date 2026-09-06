import { motion, useReducedMotion } from "framer-motion";

const WALL_PATH = "M 28.8 120 L 0 120 L 0 0 L 120 0 L 120 120 L 64.8 120";

const roomVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay, duration: 0.55, ease: "easeOut" as const },
  }),
};

/**
 * A planta do símbolo, desenhada ao vivo: o muro traça o perímetro (com o vão
 * de porta sempre aberto) e os ambientes aparecem em seguida — a sala azul
 * por último, com um leve pulso contínuo.
 *
 * `loop`: em vez de desenhar uma vez só e parar, o traço do muro repete
 * indefinidamente (retraçando o perímetro a cada ciclo) — usado como pano
 * de fundo decorativo (ex: tela de login), não na entrada da home.
 *
 * Respeita prefers-reduced-motion: quem prefere menos movimento vê o
 * símbolo já no estado final, sem desenho, flutuação nem pulso.
 */
export function HeroSymbol({ className, loop = false }: { className?: string; loop?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 120 120"
      className={className}
      animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    >
      <motion.rect
        x={8}
        y={8}
        width={55.15}
        height={39.18}
        fill="var(--color-cinza-papel)"
        variants={roomVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        custom={0.9}
      />
      <motion.rect
        x={71.15}
        y={8}
        width={40.85}
        height={39.18}
        fill="var(--color-cinza-papel)"
        variants={roomVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        custom={1.05}
      />
      <motion.rect
        x={71.15}
        y={55.18}
        width={40.85}
        height={56.82}
        fill="var(--color-cinza-papel)"
        variants={roomVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        custom={1.2}
      />
      <motion.rect
        x={8}
        y={55.18}
        width={55.15}
        height={56.82}
        fill="var(--color-azul-sinal)"
        variants={roomVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        custom={1.35}
      />
      <motion.rect
        x={8}
        y={55.18}
        width={55.15}
        height={56.82}
        fill="var(--color-azul-sinal)"
        initial={{ opacity: 0.55 }}
        animate={reduceMotion ? { opacity: 0.7 } : { opacity: [0.55, 0.85, 0.55] }}
        transition={reduceMotion ? undefined : { delay: 2, duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.path
        d={WALL_PATH}
        fill="none"
        stroke="var(--color-cinza-papel)"
        strokeWidth={6}
        strokeLinejoin="miter"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={
          reduceMotion
            ? undefined
            : loop
              ? { duration: 2.6, ease: "easeInOut", repeat: Infinity, repeatType: "loop", repeatDelay: 1.6 }
              : { duration: 1.3, ease: "easeInOut" }
        }
      />
    </motion.svg>
  );
}
