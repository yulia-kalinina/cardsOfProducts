"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Cat } from "@/lib/redux/catsSlice";
import { useAppSelector } from "@/lib/redux/hooks";
import Image from "next/image";
import Link from "next/link";
import { UiButton } from "@/components/uikit/ui-button";

export default function ProductPage() {
  const [cat, setCat] = useState<Cat | null>(null);
  const params = useParams();

  const allCats = useAppSelector((state) => state.cats.cats);
  const findCatInStore = allCats.find((item) => item.id === params.slug);

  useEffect(() => {
    if (params.slug) {
      const savedCat = sessionStorage.getItem(`cat_${params.slug}`);
      if (savedCat) {
        setCat(JSON.parse(savedCat) as Cat);
        sessionStorage.removeItem(`cat_${params.slug}`);
      } else {
        if (findCatInStore) {
          setCat(findCatInStore);
        }
      }
    }
  }, [params.slug, findCatInStore]);

  if (!cat) {
    return <div className="px-30 pt-12 text-base">No information found</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-[15px] mt-12 text-base">
      <h1 className="text-4xl font-medium mb-8">{cat.breeds?.[0].name}</h1>
      <div className="flex flex-row gap-8">
        <div className="relative h-104 w-124 overflow-hidden">
          <Image
            src={cat.url}
            alt={cat.breeds?.[0].name || "Cat"}
            fill
            className="object-cover object-left-top basis-1/3"
            unoptimized={true}
            priority={true}
          />
        </div>
        <div className="basis-2/3">
          <div className="mb-2">
            <span className="font-semibold mr-1">Weight (metric):</span>
            {cat.breeds?.[0]?.weight?.metric || "Not specified"} kg
          </div>
          <div className="mb-2">
            <span className="font-semibold mr-1">Weight (imperial):</span>
            {cat.breeds?.[0]?.weight?.imperial || "Not specified"} kg
          </div>
          <div className="mb-2">
            <span className="font-semibold mr-1">Life Span:</span>
            {cat.breeds?.[0]?.life_span}
          </div>
          <div className="mb-2">
            <span className="font-semibold mr-1">Temperament:</span>
            {cat.breeds?.[0]?.temperament}
          </div>
          <div className="mb-2">
            <span className="font-semibold mr-1">Origin:</span>
            {cat.breeds?.[0]?.origin}
          </div>
          <div className="">
            <span className="font-semibold mr-1">Description:</span>
            {cat.breeds?.[0]?.description}
          </div>

          <div className="mt-24 text-sm flex items-center justify-end gap-4">
            <Link href="/products">
              <UiButton variant="primary" className="px-4 py-2 rounded-md">
                Back to products
              </UiButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
