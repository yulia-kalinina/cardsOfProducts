import { Cat } from "@/lib/redux/catsSlice";
import ProductPageClient from "./product-page-client";
import { Metadata } from "next";

export async function generateStaticParams() {
  const response = await fetch(
    "https://api.thecatapi.com/v1/images/search?limit=20&has_breeds=1",
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY || "",
      },
      next: { revalidate: 3600 },
    }
  );

  const cats: Cat[] = await response.json();

  return cats.map((cat) => ({
    slug: cat.id,
  }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  return {
    title: `Cat ${params.slug}`,
    description: `Information about cat ${params.slug}`,
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductPageClient params={params} />;
}
