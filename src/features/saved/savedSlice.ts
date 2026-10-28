import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api } from "../../services/api"
import type { ApiResponse } from "../../types/api"

interface SavedState {
  ids: string[]
}

const initialState: SavedState = {
  ids: [],
}

export const loadSavedIds = createAsyncThunk("saved/loadIds", async () => {
  const response = await api.get<ApiResponse<string[]>>("/saved/ids")
  return response.data.data
})

export const toggleSaved = createAsyncThunk(
  "saved/toggle",
  async (listingId: string, { getState }) => {
    const { saved } = getState() as { saved: SavedState }
    const isSaved = saved.ids.includes(listingId)

    if (isSaved) {
      await api.delete(`/saved/${listingId}`)
    } else {
      await api.put(`/saved/${listingId}`)
    }

    return { listingId, saved: !isSaved }
  },
)

const savedSlice = createSlice({
  name: "saved",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSavedIds.fulfilled, (state, action) => {
        state.ids = action.payload
      })
      .addCase(toggleSaved.fulfilled, (state, action) => {
        const { listingId, saved } = action.payload

        if (saved) {
          state.ids.push(listingId)
        } else {
          state.ids = state.ids.filter((id) => id !== listingId)
        }
      })
  },
})

export default savedSlice.reducer
