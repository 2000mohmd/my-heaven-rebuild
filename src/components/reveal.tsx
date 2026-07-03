import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type Direction = "up" | "left" | "right" | "fade";

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 900,
  className = "",
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const offset = 40;
  const hiddenTransform =
    direction === "up"
      ? `translate3d(0, ${offset}px, 0)`
      : direction === "left"
        ? `translate3d(-${offset}px, 0, 0)`
        : direction === "right"
          ? `translate3d(${offset}px, 0, 0)`
          : "none";

  const style: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "translate3d(0,0,0)" : hiddenTransform,
    transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  // @ts-expect-error dynamic tag
  return (
    <As ref={ref as any} className={className} style={style}>
      {children}
    </As>
  );
}
