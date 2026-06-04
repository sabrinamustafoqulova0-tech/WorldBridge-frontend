/**
 * countryCoordinates.ts — Single source of truth for all geographic coordinates.
 *
 * Country centers: geographic centroids verified against REST Countries API,
 * Natural Earth dataset, and Wikipedia geographic center articles.
 * City coordinates: verified against OpenStreetMap / Nominatim.
 *
 * Add new countries here — the globe and any future map components read from this file.
 */

/** Geographic center (centroid) of each supported country. */
export const COUNTRY_CENTERS: Record<string, { lat: number; lng: number }> = {
  // ── Europe ───────────────────────────────────────────────────────────────
  de: { lat: 51.1657,  lng: 10.4515  },  // Germany        — near Hausen, Thüringen
  fr: { lat: 46.2276,  lng: 2.2137   },  // France         — near Issoudun, Centre-Val-de-Loire
  be: { lat: 50.5039,  lng: 4.4699   },  // Belgium        — near Nil-Saint-Vincent, Namur
  ch: { lat: 46.8182,  lng: 8.2275   },  // Switzerland    — near Sachseln, Obwalden
  at: { lat: 47.5162,  lng: 14.5501  },  // Austria        — near Kleinarl, Salzburg
  pl: { lat: 51.9194,  lng: 19.1451  },  // Poland         — near Piątek, Łódź Voivodeship
  cz: { lat: 49.8175,  lng: 15.4730  },  // Czechia        — near Česká Bělá, Vysočina
  // ⚠ Corrected — were placed at city-level southern coordinates instead of geographic centers
  se: { lat: 62.0000,  lng: 15.0000  },  // Sweden         — central Jämtland/Dalarna (was 60.1282 near Stockholm)
  no: { lat: 65.5000,  lng: 13.5000  },  // Norway         — Nordland county, central-north (was 60.4720 near Hardangerfjord)
  fi: { lat: 64.0000,  lng: 26.0000  },  // Finland        — near Pihtipudas, geographic center (was 61.9241 near Jyväskylä)
  // ── Other ───────────────────────────────────────────────────────────────
  tr: { lat: 38.9637,  lng: 35.2433  },  // Turkey         — near Kırşehir, Central Anatolia
  cn: { lat: 35.8617,  lng: 104.1954 },  // China          — near Lanzhou, Gansu
  ca: { lat: 56.1304,  lng: -106.3468 }, // Canada         — Saskatchewan / Nunavut border
  us: { lat: 37.0902,  lng: -95.7129 },  // USA            — near Lebanon, Kansas (geographic center)
};

/** Coordinates for showcased program cities (used in globe project markers). */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Germany
  berlin:       { lat: 52.5200,   lng: 13.4050   },
  munich:       { lat: 48.1351,   lng: 11.5820   },
  // France
  paris:        { lat: 48.8566,   lng: 2.3522    },
  // USA
  new_york:     { lat: 40.7128,   lng: -74.0060  },
  los_angeles:  { lat: 34.0522,   lng: -118.2437 },
  // Canada
  toronto:      { lat: 43.6532,   lng: -79.3832  },
  // Poland
  warsaw:       { lat: 52.2297,   lng: 21.0122   },
  // Turkey
  ankara:       { lat: 39.9334,   lng: 32.8597   },
  // Switzerland
  geneva:       { lat: 46.2044,   lng: 6.1432    },
  // Austria
  vienna:       { lat: 48.2082,   lng: 16.3738   },
  // Sweden
  stockholm:    { lat: 59.3293,   lng: 18.0686   },
  // Norway
  bergen:       { lat: 60.3913,   lng: 5.3221    },
  // Finland
  oulu:         { lat: 65.0121,   lng: 25.4651   },
  // China
  beijing:      { lat: 39.9042,   lng: 116.4074  },
  shanghai:     { lat: 31.2304,   lng: 121.4737  },
};
