export const formatPrice = (price: number) =>
  price === 0 ? "Free" : `Rs. ${price.toLocaleString("en-US")}`
