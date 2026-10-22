const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/users.json");

function readUsers() {
  try {
    const users = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    if (!Array.isArray(users)) {
      throw new Error("User data must be an array");
    }
    return users;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function writeUsers(users) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function toPublicUser(user) {
  if (!user) return null;
  const { id, name, email, avatar } = user;
  return { id, name, email, avatar };
}

function getUserByEmail(email) {
  return readUsers().find((user) => user.email === email) || null;
}

function getUserById(id) {
  return toPublicUser(readUsers().find((user) => user.id === id));
}

function addUser(user) {
  const users = readUsers();
  if (users.some((existing) => existing.email === user.email)) {
    return false;
  }
  users.push(user);
  writeUsers(users);
  return true;
}

module.exports = { addUser, getUserByEmail, getUserById, toPublicUser };
