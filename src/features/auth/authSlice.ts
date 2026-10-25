import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { Dispatch } from "@reduxjs/toolkit"
import { api } from "../../services/api"
import { tokenStorage } from "../../services/tokenStorage"
import { getErrorMessage } from "../../utils/errors"
import type { ApiResponse, LoginData, RegisterInput, User } from "../../types/api"

interface AuthState {
  user: User | null
  status: "idle" | "loading"
  error: string | null
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  initialized: false,
}

export const login = createAsyncThunk<User, { email: string; password: string }, { rejectValue: string }>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<LoginData>>("/auth/login", credentials)
      const { accessToken, refreshToken, user } = response.data.data

      tokenStorage.setTokens(accessToken, refreshToken)
      return user
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const register = createAsyncThunk<void, RegisterInput, { rejectValue: string }>(
  "auth/register",
  async (input, { rejectWithValue }) => {
    try {
      await api.post("/auth/register", input)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const loadSession = createAsyncThunk<User | null>("auth/loadSession", async () => {
  if (!tokenStorage.getAccessToken()) {
    return null
  }

  const response = await api.get<ApiResponse<User>>("/auth/me")
  return response.data.data
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearSession(state) {
      state.user = null
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle"
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "idle"
        state.error = action.payload ?? "Login failed"
      })
      .addCase(register.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.status = "idle"
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "idle"
        state.error = action.payload ?? "Registration failed"
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
      })
      .addCase(loadSession.rejected, (state) => {
        state.user = null
        state.initialized = true
      })
  },
})

export const { clearSession, clearError } = authSlice.actions

export const logoutUser = () => (dispatch: Dispatch) => {
  tokenStorage.clear()
  dispatch(clearSession())
}

export default authSlice.reducer