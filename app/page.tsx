import LandingPageClient from "./LandingPageClient";

async function getStats() {
  const baseUrl = "https://worldbridge-backend.onrender.com/api/v1";
  
  try {
    const [countriesRes, programsRes] = await Promise.all([
      fetch(`${baseUrl}/countries`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/programs?size=1`, { next: { revalidate: 3600 } }),
    ]);
    
    let countriesCount = 14;
    let programsCount = 65;
    
    if (countriesRes.ok) {
      const data = await countriesRes.json();
      const list = Array.isArray(data) ? data : data?.items || [];
      if (list.length > 0) countriesCount = list.length;
    }
    
    if (programsRes.ok) {
      const data = await programsRes.json();
      if (data && typeof data.total === "number") {
        programsCount = data.total;
      } else {
        const list = Array.isArray(data) ? data : data?.items || [];
        if (list.length > 0) programsCount = list.length;
      }
    }
    
    return { countries: countriesCount, programs: programsCount };
  } catch (error) {
    console.error("Error fetching landing stats on server:", error);
    return { countries: 14, programs: 65 };
  }
}

export default async function Page() {
  const stats = await getStats();
  return <LandingPageClient initialStats={stats} />;
}
