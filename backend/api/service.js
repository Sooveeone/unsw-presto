import AsyncLock from "async-lock";
import fs from "fs";
import jwt from "jsonwebtoken";
import { AccessError, InputError } from "./error";

const lock = new AsyncLock();

const JWT_SECRET = "llamallamaduck";
const DATABASE_FILE = "./database.json";
const { KV_REST_API_URL, KV_REST_API_TOKEN, USE_VERCEL_KV } = process.env;
/***************************************************************
                       State Management
***************************************************************/

let admins = {};

const sessionTimeouts = {};

const update = async (admins) =>
  new Promise((resolve, reject) => {
    lock.acquire("saveData", async () => {
      try {
        if (USE_VERCEL_KV) {
          // Store to Vercel KV
          const response = await fetch(`${KV_REST_API_URL}/set/admins`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${KV_REST_API_TOKEN}`,
            },
            body: JSON.stringify({ admins }),
          });
          if (!response.ok) {
            reject(new Error("Writing to Vercel KV failed"));
          }
        } else {
          // Store to local file system
          fs.writeFileSync(
            DATABASE_FILE,
            JSON.stringify(
              {
                admins,
              },
              null,
              2
            )
          );
        }
        resolve();
      } catch(error) {
        console.log(error);
        reject(new Error("Writing to database failed"));
      }
    });
  });

export const save = () => update(admins);
export const reset = () => {
  update({});
  admins = {};
};

try {
  if (USE_VERCEL_KV) {
    // Setup default admin object in KV DB
    save();

    // Read from Vercel KV
    fetch(`${KV_REST_API_URL}/get/admins`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        admins = JSON.parse(data.result)["admins"];
      });
  } else {
    // Read from local file
    const data = JSON.parse(fs.readFileSync(DATABASE_FILE));
    admins = data.admins;
  }
} catch(error) {
  console.log("WARNING: No database found, create a new one");
  save();
}

/***************************************************************
                       Helper Functions
***************************************************************/

export const userLock = (callback) =>
  new Promise((resolve, reject) => {
    lock.acquire("userAuthLock", callback(resolve, reject));
  });

/***************************************************************
                       Auth Functions
***************************************************************/

export const getEmailFromAuthorization = (authorization) => {
  try {
    const token = authorization.replace("Bearer ", "");
    const { email } = jwt.verify(token, JWT_SECRET);
    if (!(email in admins)) {
      throw new AccessError("Invalid Token");
    }
    return email;
  } catch(error) {
    throw new AccessError("Invalid token");
  }
};

export const login = (email, password) =>
  userLock((resolve, reject) => {
    if (email in admins) {
      if (admins[email].password === password) {
        resolve(jwt.sign({ email }, JWT_SECRET, { algorithm: "HS256" }));
      }
    }
    reject(new InputError("Invalid username or password"));
  });

export const logout = (email) =>
  userLock((resolve, reject) => {
    admins[email].sessionActive = false;
    resolve();
  });

export const register = (email, password, name) =>
  userLock((resolve, reject) => {
    if (email in admins) {
      return reject(new InputError("Email address already registered"));
    }
    admins[email] = {
      name,
      password,
      store: {},
    };
    const token = jwt.sign({ email }, JWT_SECRET, { algorithm: "HS256" });
    resolve(token);
  });

/***************************************************************
                       Store Functions
***************************************************************/

export const getStore = (email) =>
  userLock((resolve, reject) => {
    resolve(admins[email].store);
  });

export const setStore = (email, store) =>
  userLock((resolve, reject) => {
    admins[email].store = store;
    resolve();
  });
