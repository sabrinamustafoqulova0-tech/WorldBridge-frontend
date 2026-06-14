import CountriesListClient from "./CountriesListClient";

async function getCountries() {
  const baseUrl = "https://worldbridge-backend.onrender.com/api/v1";
  try {
    const res = await fetch(`${baseUrl}/countries`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("Error fetching countries on server:", err);
    return [];
  }
}

export default async function CountriesListPage() {
  const countries = await getCountries();
  return <CountriesListClient initialCountries={countries} />;
}
