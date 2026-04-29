import { useEffect, useMemo, useState } from "react";
import {
  createList,
  createTodo,
  deleteList,
  deleteTodo,
  getLists,
  getTodosForList,
  login,
  register,
  toggleTodo
} from "./api";

const SESSION_MS = 10 * 60 * 1000;

function getStoredSession() {
  try {
    const raw = localStorage.getItem("todo_session");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem("todo_session");
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(() => getStoredSession());
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState("");
  const [newListName, setNewListName] = useState("");
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const token = session?.token || "";

  const activeUser = useMemo(() => session?.user?.username || "", [session]);
  const activeListName = useMemo(
    () => lists.find((l) => l._id === activeListId)?.name || "Checklist",
    [lists, activeListId]
  );

  useEffect(() => {
    if (!token) return;

    getLists(token)
      .then((data) => {
        setLists(data);
        const firstId = data?.[0]?._id || "";
        setActiveListId((prev) => prev || firstId);
      })
      .catch((err) => {
        setMessage(err.message);
        doLogout();
      });
  }, [token]);

  useEffect(() => {
    if (!token || !activeListId) return;

    getTodosForList(token, activeListId)
      .then(setTodos)
      .catch((err) => {
        setMessage(err.message);
        doLogout();
      });
  }, [token, activeListId]);

  useEffect(() => {
    if (!session) return;

    const timeout = setTimeout(() => {
      doLogout();
      setMessage("Session expired after 10 minutes. Please login again.");
    }, Math.max(0, session.expiresAt - Date.now()));

    return () => clearTimeout(timeout);
  }, [session]);

  function setNewSession(data) {
    const next = { ...data, expiresAt: Date.now() + SESSION_MS };
    localStorage.setItem("todo_session", JSON.stringify(next));
    setSession(next);
  }

  function doLogout() {
    localStorage.removeItem("todo_session");
    setSession(null);
    setLists([]);
    setActiveListId("");
    setTodos([]);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const action = mode === "login" ? login : register;
      const data = await action(username, password);
      setNewSession(data);
      setUsername("");
      setPassword("");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setMessage("");
    if (!newTask.trim()) return;

    try {
      const created = await createTodo(token, newTask.trim(), activeListId);
      setTodos((prev) => [created, ...prev]);
      setNewTask("");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleCreateList(event) {
    event.preventDefault();
    setMessage("");
    if (!newListName.trim()) return;

    try {
      const created = await createList(token, newListName.trim());
      setLists((prev) => [created, ...prev]);
      setActiveListId(created._id);
      setNewListName("");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDeleteActiveList() {
    if (!activeListId) return;
    setMessage("");

    try {
      await deleteList(token, activeListId);
      setLists((prev) => prev.filter((l) => l._id !== activeListId));
      setTodos([]);
      setActiveListId((prev) => {
        const remaining = lists.filter((l) => l._id !== prev);
        return remaining?.[0]?._id || "";
      });
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await toggleTodo(token, id);
      setTodos((prev) => prev.map((todo) => (todo._id === id ? updated : todo)));
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteTodo(token, id);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!session) {
    return (
      <main className="page auth-page">
        <section className="auth-card">
          <h1>RedBlack Notes</h1>
          <p className="muted">Simple notes and checklist workspace</p>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              required
            />
            <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
          </form>

          <button
            type="button"
            className="secondary"
            onClick={() => {
              setMode((prev) => (prev === "login" ? "register" : "login"));
              setMessage("");
            }}
          >
            {mode === "login" ? "Register new user" : "Back to login"}
          </button>

          {message ? <p className="message">{message}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="page app-shell">
      <aside className="sidebar">
        <h2>RedBlack Notes</h2>
        <p className="muted">Hi {activeUser}</p>

        <form onSubmit={handleCreateList} className="new-list">
          <input
            value={newListName}
            onChange={(e) => {
              setMessage("");
              setNewListName(e.target.value);
            }}
            placeholder="Create a new list"
          />
          <button type="submit">Create list</button>
        </form>

        <div className="lists-bar">
          <select
            value={activeListId}
            onChange={(e) => {
              setMessage("");
              setActiveListId(e.target.value);
            }}
          >
            {lists.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>
          <button type="button" className="danger" onClick={handleDeleteActiveList}>
            Delete
          </button>
        </div>

        <button className="logout-btn" onClick={doLogout}>
          Logout
        </button>
      </aside>

      <section className="workspace">
        <header className="top">
          <div>
            <h1>{activeListName}</h1>
            <p className="muted">Session auto-logout in 10 minutes</p>
          </div>
        </header>

        <form onSubmit={handleCreate} className="new-task">
          <input
            value={newTask}
            onChange={(e) => {
              setMessage("");
              setNewTask(e.target.value);
            }}
            placeholder="Add a new task"
          />
          <button type="submit">Add</button>
        </form>

        {todos.length ? (
          <ul className="list">
            {todos.map((todo) => (
              <li key={todo._id} className="item">
                <button
                  className={`check ${todo.completed ? "done" : ""}`}
                  onClick={() => handleToggle(todo._id)}
                >
                  <span className="box" />
                  <span className="text">{todo.title}</span>
                </button>
                <button className="delete" onClick={() => handleDelete(todo._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No notes in this list yet.</p>
            <p className="muted">Add your first note above.</p>
          </div>
        )}

        {message ? <p className="message">{message}</p> : null}
      </section>
    </main>
  );
}
