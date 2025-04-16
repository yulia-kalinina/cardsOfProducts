"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cat, fetchCatById } from "@/lib/redux/catsSlice";
import Image from "next/image";
import Link from "next/link";
import { UiButton } from "@/components/uikit/ui-button";
import { useAppDispatch } from "@/lib/redux/hooks";

interface ProductPageClientProps {
    slug: string;
  };

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("No cat ID provided");
      return;
    }

    const loadCat = async () => {
      try {
        setLoading(true);
        setError(null);

        if (typeof window !== "undefined") {
          const catsState = localStorage.getItem("catsState");
          if (catsState) {
            const parsedState = JSON.parse(catsState);
            const localCat = parsedState.cats?.find(
              (item: Cat) => item.id === slug
            );
            if (localCat) {
              setCat(localCat);
              return;
            }
          }
        }

        const response = await dispatch(fetchCatById(slug)).unwrap();
        if (response) {
          setCat(response);
        } else {
          throw new Error("Cat not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        router.push("/not-found");
      } finally {
        setLoading(false);
      }
    };

    loadCat();
  }, [slug, dispatch, router]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-[15px] pt-12 text-base">
        Loading...
      </div>
    );
  }

  if (error || !cat) {
    return (
      <div className="max-w-[1200px] mx-auto px-[15px] pt-12 text-base">
        {error || "No information found"}
      </div>
    );
  }

  if (!cat?.breeds) return <div className="max-w-[1200px] mx-auto px-[15px] pt-12 text-base">There is no info about breeds</div>;

  const breed = cat.breeds?.[0];

  return (
    <div className="max-w-[1200px] mx-auto px-[15px] mt-12 text-base">
      <h1 className="text-4xl font-medium mb-8">
        {breed?.name || "Unnamed Cat"}
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative h-96 w-full md:w-96 overflow-hidden">
          <Image
            src={cat.url}
            alt={breed?.name || "Cat"}
            fill
            className="object-cover object-left-top basis-1/3"
            unoptimized={true}
            priority={true}
          />
        </div>
        <div className="flex-1">
          <div className="mb-2">
            <span className="font-semibold mr-1">Weight (metric):</span>
            {breed?.weight?.metric || "Not specified"} kg
          </div>
          <div className="mb-2">
            <span className="font-semibold mr-1">Weight (imperial):</span>
            {breed?.weight?.imperial || "Not specified"} kg
          </div>
          <div className="mb-2">
            <span className="font-semibold mr-1">Life Span:</span>
            {breed?.life_span || "Not specified"}
          </div>
          <div className="mb-2">
            <span className="font-semibold mr-1">Temperament:</span>
            {breed?.temperament || "Not specified"}
          </div>
          <div className="mb-2">
            <span className="font-semibold mr-1">Origin:</span>
            {breed?.origin || "Not specified"}
          </div>
          <div className="mb-8">
            <span className="font-semibold mr-1">Description:</span>
            {breed?.description || "Not specified"}
          </div>

          <div className="text-sm flex items-center justify-end gap-4">
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
