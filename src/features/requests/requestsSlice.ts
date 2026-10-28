import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api } from "../../services/api"
import { getErrorMessage } from "../../utils/errors"
import type { RequestInput } from "../../types/api"

interface RequestsState {
  sendStatus: "idle" | "loading"
  sendError: string | null
}

const initialState: RequestsState = {
  sendStatus: "idle",
  sendError: null,
}

export const sendRequest = createAsyncThunk<
  void,
  RequestInput,
  { rejectValue: string }
>("requests/send", async (input, { rejectWithValue }) => {
  try {
    await api.post("/requests", input)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error))
  }
})

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    resetSend(state) {
      state.sendStatus = "idle"
      state.sendError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendRequest.pending, (state) => {
        state.sendStatus = "loading"
        state.sendError = null
      })
      .addCase(sendRequest.fulfilled, (state) => {
        state.sendStatus = "idle"
      })
      .addCase(sendRequest.rejected, (state, action) => {
        state.sendStatus = "idle"
        state.sendError = action.payload ?? "Could not send the request"
      })
  },
})

export const { resetSend } = requestsSlice.actions
export default requestsSlice.reducer
