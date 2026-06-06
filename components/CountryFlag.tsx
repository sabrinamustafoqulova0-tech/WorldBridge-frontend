const COUNTRIES: Record<string, { nameRu: string; nameEn: string }> = {
  de: { nameRu: "Германия",   nameEn: "Germany"     },
  fr: { nameRu: "Франция",    nameEn: "France"       },
  be: { nameRu: "Бельгия",    nameEn: "Belgium"      },
  ch: { nameRu: "Швейцария",  nameEn: "Switzerland"  },
  at: { nameRu: "Австрия",    nameEn: "Austria"      },
  pl: { nameRu: "Польша",     nameEn: "Poland"       },
  cz: { nameRu: "Чехия",      nameEn: "Czechia"      },
  se: { nameRu: "Швеция",     nameEn: "Sweden"       },
  no: { nameRu: "Норвегия",   nameEn: "Norway"       },
  fi: { nameRu: "Финляндия",  nameEn: "Finland"      },
  tr: { nameRu: "Турция",     nameEn: "Turkey"       },
  cn: { nameRu: "Китай",      nameEn: "China"        },
  ca: { nameRu: "Канада",     nameEn: "Canada"       },
  us: { nameRu: "США",        nameEn: "USA"          },
};

const SIZE_CLS = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
} as const;

interface CountryFlagProps {
  slug: string;
  size?: keyof typeof SIZE_CLS;
  showName?: boolean;
  lang?: "ru" | "en" | "tj";
  className?: string;
}

export function CountryFlag({
  slug,
  size = "md",
  showName = false,
  lang = "ru",
  className,
}: CountryFlagProps) {
  const key = slug.toLowerCase();
  const country = COUNTRIES[key];
  if (!country) return null;

  const name = lang === "ru" ? country.nameRu : country.nameEn;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://flagcdn.com/w40/${key}.png`}
        alt={name}
        className={`${SIZE_CLS[size]} rounded-full object-cover shrink-0`}
        loading="lazy"
      />
      {showName && (
        <span className="text-[11px] font-medium text-[var(--muted)]">{name}</span>
      )}
    </span>
  );
}

export { COUNTRIES };
