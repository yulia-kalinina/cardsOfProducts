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
  if (typeof window === "undefined") return undefined;

  try {
    const serializedState = localStorage.getItem("catsState");
    if (!serializedState) return undefined;

    const parsed = JSON.parse(serializedState);

    return {
      cats: Array.isArray(parsed.cats)
        ? parsed.cats.map((cat: Cat) => ({
            ...cat,
            isFavorite: cat.isFavorite || false,
          }))
        : [],
      status: "succeeded",
      error: null,
      currentPage: 1,
      itemsPerPage: 3,
      showFavorites: parsed.showFavorites || false,
    };
  } catch {
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
      "https://api.thecatapi.com/v1/images/search?limit=20&has_breeds=1",
      {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_CAT_API_KEY,
        },
      }
    );

    const catsWithBreeds = response.data.filter(
      (cat) => cat.breeds && cat.breeds.length > 0
    );

    if (catsWithBreeds.length === 0) {
      return rejectWithValue("Api returned cats but no breed info");
    }

    return catsWithBreeds;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Unknown error");
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
