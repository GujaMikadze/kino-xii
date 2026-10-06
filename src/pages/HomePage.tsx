import { useFilterOptions } from "../hooks/useFilterOptions";

export default function HomePage() {
  const { data, isLoading, error } = useFilterOptions();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Home</h1>
      <p>Venues: {data?.venues.map((v) => v.name).join(", ")}</p>
    </div>
  );
}