"use client";

import { Cat, deleteCat, toggleFavorite } from "@/lib/redux/catsSlice";
import Image from "next/image";
import { CrossIcon } from "./icons/cross-icon";
import { LikeIcon } from "./icons/like-icon";
import clsx from "clsx";
import { useAppDispatch } from "@/lib/redux/hooks";
import Link from "next/link";
import { MouseEvent } from "react";

interface CatCardProps {
  cat: Cat;
}

export function CatCard({ cat }: CatCardProps) {
  console.log("show current cat info in card component:", cat);
  const dispatch = useAppDispatch();

  const breed = cat.breeds?.[0];

  const handleLikeClick = (e: MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(toggleFavorite(cat.id));
  };

  const handleDeleteClick = (e: MouseEvent): void => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Are you sure you want to delete this card?")) {
      dispatch(deleteCat(cat.id));
    }
  };

  return (
    <Link
      href={`/products/${cat.id}`}
      className="block cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="bg-white h-[600px] rounded-lg shadow-md overflow-hidden grid grid-rows-[auto_1fr_auto]">
        <div className="relative h-64 w-full overflow-hiddenn">
          <Image
            src={cat.url}
            alt={breed?.name || "Cat"}
            fill
            className="object-cover object-left-top"
            unoptimized={true}
            priority={true}
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">
            {breed?.name || "Unknown breed"}
          </h2>
          {breed && (
            <>
              <div className="mb-2">
                <span className="font-semibold mr-1">Weight (metric):</span>
                {breed.weight.metric} kg
              </div>
              <div className="mb-2">
                <span className="font-semibold mr-1">Weight (imperial):</span>
                {breed.weight.imperial} kg
              </div>
              <div className="mb-2">
                <span className="font-semibold mr-1">Life Span:</span>
                {breed.life_span}
              </div>
              <div className="mb-2 line-clamp-2">
                <span className="font-semibold mr-1">Temperament:</span>
                {breed.temperament}
              </div>
              <div className="mb-2">
                <span className="font-semibold mr-1">Origin:</span>
                {breed.origin}
              </div>
              <div className="mb-2">
                <p className="line-clamp-3">
                  <span className="font-semibold mr-1">Description:</span>
                  {breed.description}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-between items-center px-4 pb-4 pt-1">
          <button
            onClick={handleLikeClick}
            className={clsx(
              cat.isFavorite ? "text-blue-600" : "text-slate-600",
              "hover:cursor-pointer transition-colors"
            )}
          >
            <LikeIcon />
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-red-700 hover:cursor-pointer"
          >
            <CrossIcon />
          </button>
        </div>
      </div>
    </Link>
  );
}
