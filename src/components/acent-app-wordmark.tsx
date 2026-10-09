import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "700"],
});

const wordmarkClassName = `${montserrat.className} font-bold leading-none tracking-tight text-white`;

type AcentAppWordmarkProps = {
  as?: "h1" | "p" | "span";
  className?: string;
  tagline?: boolean;
};

export function AcentAppWordmark({
  as: Tag = "span",
  className,
  tagline = false,
}: AcentAppWordmarkProps) {
  const name = (
    <>
      Acent<span className="text-[#b7d7ec]">App</span>
    </>
  );

  if (!tagline) {
    return <Tag className={`${wordmarkClassName} ${className ?? ""}`}>{name}</Tag>;
  }

  return (
    <div className={className}>
      <Tag className={`${wordmarkClassName} block text-[1em]`}>{name}</Tag>
      <p
        className={`${montserrat.className} mt-[0.7em] text-[0.19em] font-medium uppercase leading-none tracking-[0.68em] text-zinc-300`}
      >
        Athlete development
      </p>
    </div>
  );
}
