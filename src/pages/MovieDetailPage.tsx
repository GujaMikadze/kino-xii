import { useParams } from "react-router-dom";

export default function MovieDetailPage() {
  const { slug } = useParams();
  return <h1 className="text-2xl font-bold">Movie: {slug}</h1>;
}