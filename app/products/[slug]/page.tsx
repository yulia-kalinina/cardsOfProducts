import { Cat } from "@/lib/redux/catsSlice";
import ProductPageClient from "./product-page-client";
import { Metadata } from "next";

type Props = Promise<{ slug: string }>;

export async function generateStaticParams() {
  try {
    const response = await fetch(
      "https://api.thecatapi.com/v1/images/search?limit=20&has_breeds=1",
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY || "",
        }
      }
    );

    if (!response.ok) throw new Error("Failed to fetch cats");
    
    const cats: Cat[] = await response.json();
    
    return cats
      .filter(cat => cat.breeds?.length) // Фильтрация котов с breeds
      .map(cat => ({
        slug: cat.id
      }));
      
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return []; 
  }
}

export async function generateMetadata(props: {
  params: Props;
}): Promise<Metadata> {
  const { slug } = await props.params;
  return {
    title: `Cat ${slug}`,
    description: `Information about cat ${slug}`,
  };
}

export default async function Page(props: { params: Props }) {
  const { slug } = await props.params;
  return <ProductPageClient slug={slug} />;
}
