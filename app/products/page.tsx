"use client";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchCats, nextPage, prevPage, goToPage } from "@/lib/redux/catsSlice";
import { CatCard } from "@/components/cat-card";
import { useEffect, useState } from "react";
import { LeftArrowIcon } from "@/components/icons/left-arrow";
import { RightArrowIcon } from "@/components/icons/right-arrow";
import { UiButton } from "@/components/uikit/ui-button";
import { toggleShowFavorites } from "@/lib/redux/catsSlice";

export default function Products() {
  const [isClient, setIsClient] = useState(false);

  const dispatch = useAppDispatch();

  const {
    cats: allCats,
    status,
    error,
    currentPage,
    showFavorites,
    itemsPerPage,
  } = useAppSelector((state) => state.cats);

  useEffect(() => {
    console.log("UI Component - Cats:", {
      count: allCats.length,
      sample: allCats.slice(0, 3) // Первые 3 кота для примера
    });
    setIsClient(true);
    if (status === "idle") {
      console.log("Dispatching fetch...");
      dispatch(fetchCats({  }));
    }
  }, [dispatch, status, allCats.length, allCats]);

  const filteredCats = showFavorites
    ? allCats.filter((cat) => cat.isFavorite)
    : allCats;

  const totalPages = Math.max(1, Math.ceil(filteredCats.length / itemsPerPage));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const currentCats = filteredCats.slice(startIndex, startIndex + itemsPerPage);

  if (!isClient || status === "loading") {
    return <div className="text-center py-8">Loading... </div>;
  }

  if (status === "failed") {
    return <div className="text-center py-8">Error:{error} </div>;
  }

  if (allCats.length === 0)
    return <div className="text-center py-8">No cats available</div>;

  const handleFilterClick = () => {
    dispatch(toggleShowFavorites());
    dispatch(goToPage(1));
  };

  console.log("show all cats in /product:", allCats);

  return (
    <div className="max-w-[1200px] mx-auto px-[15px] mt-12 text-sm">
      <div className="pb-4 flex items-center justify-end">
        <UiButton
          type="button"
          variant="primary"
          className="px-4 py-2 rounded-md"
          onClick={handleFilterClick}
        >
          {showFavorites ? "Show all" : "Show favorites"}
        </UiButton>
      </div>

      <h1 className="text-4xl font-medium mb-8">
        {showFavorites ? "Your favorite cats" : "All cat breeds"}
      </h1>

      {showFavorites && filteredCats.length === 0 ? (
        <div className="text-center py-8">
          There are not any favorite cats yet
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCats.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </div>

          <div className="mt-12 mb-10 flex gap-10 justify-center text-base">
            <button
              onClick={() => dispatch(prevPage())}
              disabled={currentPage === 1}
              className="disabled:opacity-50"
            >
              <LeftArrowIcon />
            </button>

            <div className="flex gap-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => dispatch(goToPage(page))}
                    disabled={page === currentPage}
                    className={`${
                      page === currentPage
                        ? "text-slate-800 font-medium"
                        : "text-slate-400"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => dispatch(nextPage())}
              disabled={currentPage === totalPages}
              className="disabled:opacity-50"
            >
              <RightArrowIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
