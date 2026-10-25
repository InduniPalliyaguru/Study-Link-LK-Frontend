import axios from "axios"

interface ErrorBody {
  message?: string
  errors?: { field: string; message: string }[]
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ErrorBody | undefined

    if (body?.errors?.length) {
      return body.errors.map((item) => item.message).join(". ")
    }

    if (body?.message) {
      return body.message
    }

    if (!error.response) {
      return "Cannot reach the server. Please check your connection"
    }
  }

  return "Something went wrong. Please try again"
}
