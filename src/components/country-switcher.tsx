import { useCountry } from "@/hooks/use-country";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/lib/country";

export function CountrySwitcher({ light = false }: { light?: boolean }) {
  const { country, setCountry, info } = useCountry();
  return (
    <label
      className={
        "relative flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] cursor-pointer " +
        (light ? "text-white/95" : "text-foreground/80")
      }
    >
      <span aria-hidden>{info.flag}</span>
      <span className="hidden sm:inline">{country ?? "LB"}</span>
      <select
        value={country ?? "LB"}
        onChange={(e) => setCountry(e.target.value as CountryCode)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Change country"
      >
        {COUNTRY_CODES.map((c) => (
          <option key={c} value={c}>
            {COUNTRIES[c].flag} {COUNTRIES[c].name} · {COUNTRIES[c].currency}
          </option>
        ))}
      </select>
    </label>
  );
}
