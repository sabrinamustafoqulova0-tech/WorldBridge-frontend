import CountryPageClient from "./CountryPageClient";

async function getCountryData(id: string) {
  const baseUrl = "https://worldbridge-backend.onrender.com/api/v1";
  
  try {
    const [countryRes, programsRes, faqRes] = await Promise.all([
      fetch(`${baseUrl}/countries/${id}`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/countries/${id}/programs`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/countries/${id}/faq`, { next: { revalidate: 3600 } }),
    ]);
    
    if (!countryRes.ok) {
      return { country: null, programs: [], faqs: [] };
    }
    
    const country = await countryRes.json();
    const programsData = await programsRes.json();
    const faqs = await faqRes.json();
    
    return {
      country,
      programs: programsData.items || [],
      faqs: faqs || [],
    };
  } catch (error) {
    console.error(`Error fetching country ${id} data on server:`, error);
    return { country: null, programs: [], faqs: [] };
  }
}

export async function generateStaticParams() {
  const baseUrl = "https://worldbridge-backend.onrender.com/api/v1";
  try {
    const res = await fetch(`${baseUrl}/countries`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || [];
    return items.map((c: any) => ({
      id: c.slug,
    }));
  } catch (e) {
    console.error("Error in generateStaticParams for countries:", e);
    return [];
  }
}

export default async function CountryPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const data = await getCountryData(id);
  
  return <CountryPageClient countryId={id} initialData={data} />;
}
