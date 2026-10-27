import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api } from "../../services/api"
import type { ApiResponse, ListingSummary, Meta } from "../../types/api"

interface ListingsState {
  latest: ListingSummary[]
  latestStatus: "idle" | "loading" | "failed"
  browse: ListingSummary[]
  browseMeta: Meta | null
  browseStatus: "idle" | "loading" | "failed"
}

const initialState: ListingsState = {
  latest: [],
  latestStatus: "idle",
  browse: [],
  browseMeta: null,
  browseStatus: "idle",
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
  },
})

export default listingsSlice.reducer
