export async function generateStaticParams() {
  try {
    const response = await fetch(
      "https://api.thecatapi.com/v1/images/search?limit=20&has_breeds=1",
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY || "",
        },
      }
    );

    const cats = await response.json();

    const userCats = JSON.parse(localStorage.getItem("catsState") || "[]");

    return [...cats, ...userCats].map((cat: { id: string }) => ({
      slug: cat.id,
    }));
  } catch (error) {
    console.error("Error in generateStaticParams:", error);
    return [];
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
