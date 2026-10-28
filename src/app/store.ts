import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import catalogReducer from "../features/catalog/catalogSlice"
import listingsReducer from "../features/listings/listingsSlice"
import savedReducer from "../features/saved/savedSlice"
import requestsReducer from "../features/requests/requestsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    catalog: catalogReducer,
    listings: listingsReducer,
    saved: savedReducer,
    requests: requestsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
