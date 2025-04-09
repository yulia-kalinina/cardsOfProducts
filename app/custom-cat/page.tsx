"use client";

export default function CustomCatPage() {
  const params = new URLSearchParams(window.location.search);
  console.log(params);
  const cat = {
    id: params.get("id"),
    name: params.get("name"),
  };

  if (!cat.id) {
    return (
      <div className="max-w-[1200px] mx-auto px-[15px] mt-12 text-base">
        The cat is not found
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-[15px] mt-12 text-base">
      <h1>{cat.name}</h1>
    </div>
  );
}
