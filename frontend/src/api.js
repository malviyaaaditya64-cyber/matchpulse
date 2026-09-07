const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

async function getJSON(path) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${BASE}${path}`;
  console.log("Fetching:", url);
  const res = await fetch(url, { headers });
  if (res.status === 401) {
    setToken(null); // token expired/invalid — force re-login
    throw new Error("Session expired, please log in again");
  }
  if (!res.ok) {
    console.error("API error response:", await res.clone().text());
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${path}`);
  }
  return res.json();
}

async function postJSON(path, data) {
  const url = `${BASE}${path}`;
  console.log("Posting to:", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.detail || `Request failed: ${path}`);
  }
  return body;
}

export const api = {
  listSports: () => getJSON("/sports"),
  listTeams: (sport) => getJSON(sport ? `/teams?sport=${encodeURIComponent(sport)}` : "/teams"),
  getSeason: (team) => getJSON(`/season/${encodeURIComponent(team)}`),
  getAnalysis: (team) => getJSON(`/analysis/${encodeURIComponent(team)}`),
  getQuotes: (matchId) => getJSON(`/quotes/${encodeURIComponent(matchId)}`),

  register: async (username, password) => {
    const data = await postJSON("/auth/register", { username, password });
    setToken(data.access_token);
    localStorage.setItem("username", data.username);
    return data;
  },
  login: async (username, password) => {
    const data = await postJSON("/auth/login", { username, password });
    setToken(data.access_token);
    localStorage.setItem("username", data.username);
    return data;
  },
  logout: () => {
    setToken(null);
    localStorage.removeItem("username");
  },
  isLoggedIn: () => !!getToken(),
  getStoredUsername: () => localStorage.getItem("username"),
};
