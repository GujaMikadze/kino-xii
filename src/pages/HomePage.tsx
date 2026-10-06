import { useFilterOptions } from "../hooks/useFilterOptions";
import Hero from "../features/home/Hero";

export default function HomePage() {
  const { data, isLoading, error } = useFilterOptions();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Hero></Hero>
  );
}