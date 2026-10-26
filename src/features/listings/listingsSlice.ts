import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api } from "../../services/api"
import type { ApiResponse, ListingSummary } from "../../types/api"

interface ListingsState {
  latest: ListingSummary[]
  latestStatus: "idle" | "loading" | "failed"
}

const initialState: ListingsState = {
  latest: [],
  latestStatus: "idle",
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
  },
})

export default listingsSlice.reducer
