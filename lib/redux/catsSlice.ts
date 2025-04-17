import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { notFound } from "next/navigation";

export interface CatBreed {
  id: string;
  name: string;
  weight: {
    imperial: string;
    metric: string;
  };
  life_span: string;
  temperament: string;
  description: string;
  origin: string;
}

export interface Cat {
  id: string;
  url: string;
  breeds?: CatBreed[];
  width: number;
  height: number;
  isFavorite: boolean;
}

export interface CatsState {
  cats: Cat[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  showFavorites: boolean;
}

export interface FetchCatsParams {
  limit?: number;
  has_breeds?: number;
}

const loadState = (): CatsState | undefined => {
  if (typeof window === "undefined") {
    console.log("Server-side: localStorage unavailable");
    return undefined;
  }

  try {
    const data = localStorage.getItem("catsState");
    if (!data) return undefined;

    const parsed = JSON.parse(data);

    if (Array.isArray(parsed.cats) && parsed.cats.length === 0) {
      console.log("Ignoring empty cats array from localStorage");
      return undefined;
    }

    return {
      cats: parsed.cats.map((cat: Cat) => ({
        ...cat,
        isFavorite: cat.isFavorite || false,
      })) || [],
      status: parsed.status || "idle", // Сбрасываем статус
      error: null,
      currentPage: 1,
      itemsPerPage: 3,
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

export const fetchCats = createAsyncThunk<
  Cat[],
  FetchCatsParams,
  { rejectValue: string }
>("cats/fetchCats", async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get<Cat[]>(
      "https://api.thecatapi.com/v1/images/search",
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY || "",
        },
        params: {
          limit: 20,
          has_breeds: 1,
          breed_id: "all",
          size: "small",
          order: "RANDOM",
        },
      }
    );

    const validCats = response.data.filter((cat) => {
      const hasValidBreeds =
        cat.breeds?.length && cat.breeds[0].name && cat.breeds[0].id;
      return hasValidBreeds;
    });

    if (validCats.length === 0) {
      console.warn("API returned no cats with valid breed info");
      return [];
    }

    console.log("Valid cats with breeds:", validCats.length);
    return validCats.slice(0, 20);
  } catch (error) {
    console.error("API error:", error);
    return rejectWithValue(
      axios.isAxiosError(error) ? error.message : "Unknown error"
    );
  }
});

export const fetchCatById = createAsyncThunk<
  Cat,
  string,
  { rejectValue: string }
>("cats/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get<Cat>(
      `https://api.thecatapi.com/v1/images/${id}`
    );
    if (response.status === 404) {
      return notFound();
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
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
    addCat: (state, action: PayloadAction<Cat>) => {
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
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const cat = state.cats.find((cat) => cat.id === action.payload);
      if (cat) {
        cat.isFavorite = !cat.isFavorite;

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
        console.log("Fetching cats...");
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCats.fulfilled, (state, action: PayloadAction<Cat[]>) => {
        console.log(
          "Saving to Redux. Payload:",
          action.payload.length,
          "items"
        );
        state.status = "succeeded";
        state.cats = action.payload.map((cat) => ({
          ...cat,
          isFavorite:
            state.cats.find((c) => c.id === cat.id)?.isFavorite || false,
        }));

        const saveData = {
          cats: action.payload,
          status: "succeeded",
          showFavorites: state.showFavorites,
        };
        console.log("Saving to localStorage:", saveData);

        localStorage.setItem("catsState", JSON.stringify(saveData));
      })
      .addCase(fetchCats.rejected, (state, action) => {
        console.error("Fetch failed:", action.payload);
        state.status = "failed";
        state.error = action.payload || "Failed to fecth breeds";
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
