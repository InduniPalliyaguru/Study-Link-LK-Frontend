export const formatPrice = (price: number) =>
  price === 0 ? "Free" : `Rs. ${price.toLocaleString("en-US")}`

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
