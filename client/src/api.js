const API_BASE =
  import.meta.env.VITE_API_BASE ||
  `${window.location.protocol}//${window.location.hostname}:5000/api`;

async function request(path, options = {}) {
  const { headers: optHeaders, ...rest } = options;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(optHeaders || {})
      },
      ...rest
    });
  } catch {
    throw new Error("Cannot connect to backend API. Ensure server is running on port 5000.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function register(username, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
}

export function getTodos(token) {
  return request("/todos", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getTodosForList(token, listId) {
  const query = new URLSearchParams({ listId }).toString();
  return request(`/todos?${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function createTodo(token, title, listId) {
  return request("/todos", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, listId })
  });
}

export function toggleTodo(token, id) {
  return request(`/todos/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function deleteTodo(token, id) {
  return request(`/todos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getLists(token) {
  return request("/lists", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function createList(token, name) {
  return request("/lists", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name })
  });
}

export function deleteList(token, id) {
  return request(`/lists/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}
