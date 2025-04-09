import { Cat } from "@/lib/redux/catsSlice";

export async function generateStaticParams() {

  const response = await fetch("https://api.thecatapi.com/v1/images/search");
  const cats = await response.json();

  const catsWithBreeds = cats.filter(
    (cat: Cat) => cat.breeds && cat.breeds.length > 0);

  return catsWithBreeds.map((cat: { id: string }) => ({
    slug: cat.id,
  }));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
