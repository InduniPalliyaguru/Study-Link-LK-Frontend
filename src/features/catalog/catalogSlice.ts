import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { api } from "../../services/api"
import type { ApiResponse, GradeLevel, Subject } from "../../types/api"

interface CatalogState {
  subjects: Subject[]
  gradeLevels: GradeLevel[]
  loaded: boolean
}

const initialState: CatalogState = {
  subjects: [],
  gradeLevels: [],
  loaded: false,
}

export const loadCatalog = createAsyncThunk("catalog/load", async () => {
  const [subjects, gradeLevels] = await Promise.all([
    api.get<ApiResponse<Subject[]>>("/subjects"),
    api.get<ApiResponse<GradeLevel[]>>("/grade-levels"),
  ])

  return { subjects: subjects.data.data, gradeLevels: gradeLevels.data.data }
})

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadCatalog.fulfilled, (state, action) => {
      state.subjects = action.payload.subjects
      state.gradeLevels = action.payload.gradeLevels
      state.loaded = true
    })
  },
})

export default catalogSlice.reducer
