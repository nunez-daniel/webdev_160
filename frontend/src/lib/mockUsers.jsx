const DEFAULT_USERS = [
  {
    id: 1,
    username: "johndoe@example.com",
    password: "password123",
    name: "John Doe",
  },
  {
    id: 2,
    username: "admin@example.com",
    password: "admin",
    name: "Admin User",
  },
];

if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
}

function getUsers() {
  const data = localStorage.getItem("users");
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users, null, 2));
}

export async function fetchUserByCredentials({ email: username, password }) {
  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;
  const { password: _p, ...safe } = user;
  return safe;
}

export async function signupUser({ email: username, password, name }) {
  if (!username || !password || !name) return null;

  const users = getUsers();
  const byUsername = users.find((u) => u.username === username);
  if (byUsername) {
    return null;
  }

  const nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const newUser = { id: nextId, username, password, name };
  users.push(newUser);
  saveUsers(users);

  const { password: _p, ...safe } = newUser;
  return safe;
}
