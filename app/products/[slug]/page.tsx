import { Cat } from "@/lib/redux/catsSlice";
import ProductPageClient from "./product-page-client";

export async function generateStaticParams() {
  const response = await fetch(
    "https://api.thecatapi.com/v1/images/search?limit=20&has_breeds=1",
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY || "",
      },
    }
  );

  const cats: Cat[] = await response.json();

  return cats.map((cat) => ({
    slug: cat.id,
  }));
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductPageClient params={params} />;
}
