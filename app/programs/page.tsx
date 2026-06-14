import ProgramsListClient from "./ProgramsListClient";

async function getPrograms() {
  const baseUrl = "https://worldbridge-backend.onrender.com/api/v1";
  try {
    const res = await fetch(`${baseUrl}/programs?size=100`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : [];
  } catch (err) {
    console.error("Error fetching programs on server:", err);
    return [];
  }
}

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return <ProgramsListClient initialPrograms={programs} />;
}
