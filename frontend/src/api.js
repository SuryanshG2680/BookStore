const API = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.log("API ERROR:", data);

    throw new Error(
      Array.isArray(data.detail)
        ? data.detail.map(e => `${e.loc?.join(".")}: ${e.msg}`).join("\n")
        : data.detail || "Request failed"
    );
  }
  return data;
}

export const api = {
  books: () => request("/books"),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password })
    }),
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  cart: () => request("/cart"),
  addCart: (book_id, quantity = 1) => request("/cart/items", { method: "POST", body: JSON.stringify({ book_id, quantity }) }),
  updateCart: (id, quantity) =>
  request(`/cart/items/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  }),
  removeCart: (id) => request(`/cart/items/${id}`, { method: "DELETE" }),
  checkout: (body) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
  orders: () => request("/orders"),
  cancelOrder: (id) =>
  request(`/orders/${id}/cancel`, {
    method: "PUT",
  }),
  createBook: (body) => request("/books", { method: "POST", body: JSON.stringify(body) }),
  updateBook: (id, data) =>
  request(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" })
};
