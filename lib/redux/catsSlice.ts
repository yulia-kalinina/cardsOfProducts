import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { notFound } from "next/navigation";

export interface CatBreed {
  id: string;
  name: string;
  description: string;
  temperament: string;
  origin: string;
  life_span: string;
  weight: {
    imperial: string;
    metric: string;
  };
  reference_image_id?: string;
}

export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds?: CatBreed[];
}

export interface Cat {
  id: string;
  url: string;
  breeds: CatBreed[];
  width?: number;
  height?: number;
  image?: CatImage;
  isFavorite: boolean;
  name: string;
  reference_image_id?: string;
}

export interface CatsState {
  cats: Cat[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  showFavorites: boolean;
}

const loadState = (): CatsState | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const data = localStorage.getItem("catsState");
    if (!data) return undefined;

    const parsed = JSON.parse(data);
    return {
      cats: Array.isArray(parsed.cats) ? parsed.cats : [],
      status: parsed.status || "idle",
      error: null,
      currentPage: parsed.currentPage || 1,
      itemsPerPage: parsed.itemsPerPage || 3,
      showFavorites: parsed.showFavorites || false,
    };
  } catch (error) {
    console.error("LocalStorage parse error:", error);
    return undefined;
  }
};

const initialState: CatsState = loadState() || {
  cats: [],
  status: "idle",
  error: null,
  currentPage: 1,
  itemsPerPage: 3,
  showFavorites: false,
};

export const fetchCats = createAsyncThunk<Cat[], void, { rejectValue: string }>(
  "cats/fetchCats",
  async (_, { rejectWithValue }) => {
    try {
      const breedsResponse = await axios.get<CatBreed[]>(
        "https://api.thecatapi.com/v1/breeds",
        {
          params: { limit: 20 },
          headers: { "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY! },
        }
      );

      const catsWithImages = await Promise.all(
        breedsResponse.data.map(async (breed) => {
          const imageResponse = await axios.get<CatImage[]>(
            `https://api.thecatapi.com/v1/images/search?breed_ids=${breed.id}&limit=1`
          );

          return {
            id: breed.id,
            name: breed.name,
            breeds: [breed],
            image: imageResponse.data[0],
            url: imageResponse.data[0]?.url || "",
            width: imageResponse.data[0]?.width,
            height: imageResponse.data[0]?.height,
            isFavorite: false,
            reference_image_id: breed.reference_image_id,
          } as Cat;
        })
      );

      return catsWithImages.filter((cat) => cat.image);
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue("Failed to fetch cats");
    }
  }
);

export const fetchCatById = createAsyncThunk<
  Cat,
  string,
  { rejectValue: string }
>("cats/fetchById", async (id, { rejectWithValue }) => {
  try {
    const breedResponse = await axios.get<CatBreed>(
      `https://api.thecatapi.com/v1/breeds/${id}`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY || "",
        },
      }
    );

    const imageId = breedResponse.data.reference_image_id;
    if (!imageId) {
      throw new Error("No reference image available for this breed");
    }

    const imageResponse = await axios.get<CatImage>(
      `https://api.thecatapi.com/v1/images/${imageId}`,
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY || "",
        },
      }
    );

    const cat: Cat = {
      id: breedResponse.data.id,
      name: breedResponse.data.name,
      breeds: [breedResponse.data],
      image: imageResponse.data,
      url: imageResponse.data.url,
      width: imageResponse.data.width,
      height: imageResponse.data.height,
      isFavorite: false,
      reference_image_id: imageId,
    };

    return cat;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        notFound();
      }
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Unknown error");
  }
});

export const catsSlice = createSlice({
  name: "cats",
  initialState,
  reducers: {
    goToPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    nextPage: (state) => {
      state.currentPage += 1;
    },
    prevPage: (state) => {
      state.currentPage = Math.max(1, state.currentPage - 1);
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1;
    },
    deleteCat: (state, action: PayloadAction<string>) => {
      const newCats = state.cats.filter((cat) => cat.id !== action.payload);

      const newState = {
        ...state,
        cats: newCats,
        currentPage:
          Math.min(
            state.currentPage,
            Math.ceil(newCats.length / state.itemsPerPage)
          ) || 1,
      };

      localStorage.setItem(
        "catsState",
        JSON.stringify({
          cats: newCats,
          status: state.status,
        })
      );

      return newState;
    },
    addCat: (state, action: PayloadAction<Omit<Cat, "isFavorite">>) => {
      const newCat: Cat = {
        ...action.payload,
        isFavorite: false,
      };

      const newCats = [...state.cats, newCat];
      state.cats = newCats;

      localStorage.setItem(
        "catsState",
        JSON.stringify({
          cats: newCats,
          status: state.status,
          showFavorites: state.showFavorites,
        })
      );
    },
    toggleFavorite: (state, action) => {
      const index = state.cats.findIndex((c) => c.id === action.payload);
      if (index >= 0) {
        state.cats = state.cats.map((cat, i) =>
          i === index ? { ...cat, isFavorite: !cat.isFavorite } : cat
        );

        localStorage.setItem(
          "catsState",
          JSON.stringify({
            cats: state.cats,
            status: state.status,
            showFavorites: state.showFavorites,
          })
        );
      }
    },
    toggleShowFavorites: (state) => {
      state.showFavorites = !state.showFavorites;
      state.currentPage = 1;

      localStorage.setItem(
        "catsState",
        JSON.stringify({
          cats: state.cats,
          status: state.status,
          showFavorites: state.showFavorites,
        })
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCats.fulfilled, (state, action: PayloadAction<Cat[]>) => {
        state.status = "succeeded";
        state.cats = action.payload.map((cat) => ({
          ...cat,
          isFavorite:
            state.cats.find((c) => c.id === cat.id)?.isFavorite || false,
        }));

        localStorage.setItem(
          "catsState",
          JSON.stringify({
            cats: state.cats,
            status: "succeeded",
            showFavorites: state.showFavorites,
          })
        );
      })
      .addCase(fetchCats.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch cats";
      })
      .addCase(fetchCatById.fulfilled, (state, action: PayloadAction<Cat>) => {
        const existingIndex = state.cats.findIndex(
          (c) => c.id === action.payload.id
        );
        if (existingIndex >= 0) {
          state.cats[existingIndex] = action.payload;
        } else {
          state.cats.push(action.payload);
        }
        localStorage.setItem("catsState", JSON.stringify(state));
      });
  },
});

export const {
  goToPage,
  nextPage,
  prevPage,
  setItemsPerPage,
  deleteCat,
  addCat,
  toggleFavorite,
  toggleShowFavorites,
} = catsSlice.actions;

export const catsReducer = catsSlice.reducer;
