import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useCountry } from "@/hooks/use-country";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/lib/country";
import { detectCountry } from "@/lib/country.functions";

export function CountryPickerModal() {
  const { country, setCountry } = useCountry();
  const detect = useServerFn(detectCountry);
  const [detected, setDetected] = useState<CountryCode | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (country) return;
    detect().then((r) => setDetected(r.country as CountryCode)).catch(() => setDetected("LB"));
  }, [country, detect]);

  if (!mounted || country) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-background p-8 shadow-2xl">
        <h2 className="font-display text-3xl md:text-4xl text-center">Welcome to Heaven Beauty</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Please choose your country to see local pricing and availability.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {COUNTRY_CODES.map((code) => {
            const c = COUNTRIES[code];
            const isDetected = detected === code;
            return (
              <button
                key={code}
                onClick={() => setCountry(code)}
                className={
                  "flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition hover:border-primary hover:bg-blush/30 " +
                  (isDetected ? "border-primary bg-blush/40" : "border-border")
                }
              >
                <span className="text-3xl">{c.flag}</span>
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.currency}
                    {isDetected && " · Detected"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          You can change your country later from the header.
        </p>
      </div>
    </div>
  );
}
