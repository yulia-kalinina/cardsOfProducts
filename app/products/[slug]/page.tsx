import { CatBreed } from "@/lib/redux/catsSlice";
import ProductPageClient from "./product-page-client";
import { Metadata } from "next";

type Props = Promise<{ slug: string }>;

export async function generateStaticParams() {
  try {
    const breedsResponse = await fetch("https://api.thecatapi.com/v1/breeds", {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY || "",
      },
    });
    const breeds: CatBreed[] = await breedsResponse.json();
    console.log(breeds);

    return breeds.map((breed) => {
      return { slug: breed.id };
    });
  } catch (error) {
    console.log("Error in generateStaticParams:", error);
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
