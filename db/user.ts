import { file, password as bunPassword } from "bun";
import Database, { SQLiteError } from "bun:sqlite";
import { v4 as uuidV4 } from "uuid";
import { DB_NAME } from "../utils/env";
import type { LoginUser, RegisterUser, User, UserDB } from "../@types/user";

export class UserTable {
  db: Database;
  static #schemaDumped = false;
  constructor() {
    this.db = new Database(DB_NAME);

    if (!UserTable.#schemaDumped) {
      const schemaFile = file("./utils/schema.sql");
      schemaFile.text().then((schema) => {
        this.db.run(schema);
        UserTable.#schemaDumped = true;
      });
    }
  }

  dumpSchema(schema: string) {
    this.db.run(schema);
  }

  get allUsers(): User[] {
    return this.db.query<User, []>("SELECT * FROM users;").all();
  }

  registerUser(user: RegisterUser): [User|null, string|null] {
    let existingUser = this.db
      .prepare<User, string>("SELECT * FROM users WHERE email=?;")
      .get(user.email);

    if (existingUser !== null) {
      return [null, "User already exists"];
    }
    const userID = uuidV4();

    const hashedPassword = bunPassword.hashSync(user.password, {
      algorithm: "bcrypt",
      cost: 4,
    });

    const newUser = this.db
      .prepare<User, any>(
        "INSERT INTO users(id, username, email, password) VALUES (?, ?, ?, ?) RETURNING id, username, email, inserted_at;"
      )
      .get([userID, user.username, user.email, hashedPassword]);

    if (newUser == null) {
      return [null, "Something went wrong"];
    }

    return [newUser, null];
  }

  loginUser(user: LoginUser): [User | null, string | null] {
    const userInDB = this.db
      .prepare<UserDB, any>("SELECT * FROM users WHERE email=?;")
      .get([user.email]);

    if (userInDB == null) {
      return [null, "Invalid credentials"];
    }

    if (!bunPassword.verifySync(user.password, userInDB.password, "bcrypt")) {
      return [null, "Invalid credentials"];
    }

    const u: User = {
      id: userInDB.id,
      email: userInDB.email,
      username: userInDB.username,
      inserted_at: userInDB.inserted_at,
    };

    return [u, null];
  }

  updateUser(u: Partial<RegisterUser>, id: string) {
    const args: string[] = [];
    let query = "UPDATE users SET ";

    Object.entries(u).forEach(([k, v]) => {
      if (!v || k === "password") return;

      query += `${k}=?,`;
      args.push(v);
    });

    query = query.substring(0, query.length - 1);
    query += " WHERE id=?;";
    args.push(id);

    try {
      this.db.prepare(query).run(...args);
      return null;
    } catch (e) {
      if (e instanceof SQLiteError) return e.message;
      return "Something went wrong";
    }
  }

  updatePassword(oldPassword: string, newPassword: string, userID: string) {
    const user = this.db
      .prepare<any, string>("SELECT password from users WHERE id=?;")
      .get(userID);

    if (user === null) return "User not found";

    if (!bunPassword.verifySync(oldPassword, user.password, "bcrypt")) {
      return "Wrong password";
    }

    const hashed = bunPassword.hashSync(newPassword, {
      algorithm: "bcrypt",
      cost: 4,
    });

    this.db.prepare("UPDATE users SET password=? WHERE id=?;")
      .run(hashed, userID);

    return null;
  }

  getUserByID(id: string): User | null {
    return this.db
      .prepare<User, string>("SELECT * FROM users WHERE id=?;")
      .get(id);
  }

  clearTable() {
    this.db.run("DELETE FROM users;");
  }

  closeDB() {
    this.db.close();
  }
}
