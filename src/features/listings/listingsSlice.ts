import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api } from "../../services/api"
import { getErrorMessage } from "../../utils/errors"
import type {
  ApiResponse,
  ListingDetail,
  ListingSummary,
  Meta,
} from "../../types/api"

interface ListingsState {
  latest: ListingSummary[]
  latestStatus: "idle" | "loading" | "failed"
  browse: ListingSummary[]
  browseMeta: Meta | null
  browseStatus: "idle" | "loading" | "failed"
  current: ListingDetail | null
  currentStatus: "idle" | "loading" | "failed"
  currentError: string | null
}

const initialState: ListingsState = {
  latest: [],
  latestStatus: "idle",
  browse: [],
  browseMeta: null,
  browseStatus: "idle",
  current: null,
  currentStatus: "idle",
  currentError: null,
}

export const fetchLatest = createAsyncThunk(
  "listings/fetchLatest",
  async () => {
    const response = await api.get<ApiResponse<ListingSummary[]>>("/listings", {
      params: { limit: 8, sort: "newest" },
    })

    return response.data.data
  },
)

export const fetchBrowse = createAsyncThunk(
  "listings/fetchBrowse",
  async (params: Record<string, string>) => {
    const response = await api.get<ApiResponse<ListingSummary[]>>("/listings", {
      params,
    })

    return { items: response.data.data, meta: response.data.meta as Meta }
  },
)

export const fetchListing = createAsyncThunk<
  ListingDetail,
  string,
  { rejectValue: string }
>("listings/fetchListing", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<ListingDetail>>(
      `/listings/${id}`,
    )
    return response.data.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

const listingsSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatest.pending, (state) => {
        state.latestStatus = "loading"
      })
      .addCase(fetchLatest.fulfilled, (state, action) => {
        state.latestStatus = "idle"
        state.latest = action.payload
      })
      .addCase(fetchLatest.rejected, (state) => {
        state.latestStatus = "failed"
      })
      .addCase(fetchBrowse.pending, (state) => {
        state.browseStatus = "loading"
      })
      .addCase(fetchBrowse.fulfilled, (state, action) => {
        state.browseStatus = "idle"
        state.browse = action.payload.items
        state.browseMeta = action.payload.meta
      })
      .addCase(fetchBrowse.rejected, (state) => {
        state.browseStatus = "failed"
      })
      .addCase(fetchListing.pending, (state) => {
        state.currentStatus = "loading"
        state.currentError = null
        state.current = null
      })
      .addCase(fetchListing.fulfilled, (state, action) => {
        state.currentStatus = "idle"
        state.current = action.payload
      })
      .addCase(fetchListing.rejected, (state, action) => {
        state.currentStatus = "failed"
        state.currentError = action.payload ?? "Could not load this book"
      })
  },
})

export default listingsSlice.reducer
