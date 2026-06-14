import ProgramPageClient from "./ProgramPageClient";

async function getProgramData(id: string) {
  const baseUrl = "https://worldbridge-backend.onrender.com/api/v1";
  
  try {
    const res = await fetch(`${baseUrl}/programs/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching program ${id} data on server:`, error);
    return null;
  }
}

export async function generateStaticParams() {
  const baseUrl = "https://worldbridge-backend.onrender.com/api/v1";
  try {
    const res = await fetch(`${baseUrl}/programs?size=100`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : [];
    return items.map((p: any) => ({
      id: p.slug,
    }));
  } catch (e) {
    console.error("Error in generateStaticParams for programs:", e);
    return [];
  }
}

export default async function ProgramPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const program = await getProgramData(id);
  
  return <ProgramPageClient programId={id} initialProgram={program} />;
}
