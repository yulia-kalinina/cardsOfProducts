import { Cat } from "@/lib/redux/catsSlice";
import ProductPageClient from "./product-page-client";
import { Metadata } from "next";

type Props = Promise<{ slug: string }>;

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
  return cats.map(cat => ({ slug: cat.id }));

  //const catsWithBreeds = cats.filter((cat) => cat.breeds?.length);
  //return catsWithBreeds.length > 0
  //  ? catsWithBreeds.map((cat) => ({ slug: cat.id }))
  //  : [{ slug: "default-cat" }];
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
