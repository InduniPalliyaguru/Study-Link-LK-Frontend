const ACCESS_KEY = "studylink_access_token"
const REFRESH_KEY = "studylink_refresh_token"

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  },

  setAccessToken: (accessToken: string) => {
    localStorage.setItem(ACCESS_KEY, accessToken)
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
