import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"
import { tokenStorage } from "./tokenStorage"

const baseURL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({ baseURL })

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"]

const isPublic = (url?: string) =>
  PUBLIC_PATHS.some((path) => url?.includes(path))

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()

  if (token && !isPublic(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshing: Promise<string> | null = null

const requestNewAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken()

  if (!refreshToken) {
    throw new Error("No refresh token")
  }

  const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
  const accessToken: string = response.data.data.accessToken

  tokenStorage.setAccessToken(accessToken)
  return accessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isPublic(original.url)
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      refreshing =
        refreshing ??
        requestNewAccessToken().finally(() => {
          refreshing = null
        })

      const newToken = await refreshing
      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch (refreshError) {
      tokenStorage.clear()
      window.dispatchEvent(new Event("auth:logout"))
      return Promise.reject(refreshError)
    }
  },
)
