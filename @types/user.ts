export type UserDB = {
  id: string;
  username: string;
  email: string;
  password: string;
  inserted_at: string;
};

export type User = Omit<UserDB, "password">;

export type RegisterUser = Omit<UserDB, "inserted_at" | "id">;

export type LoginUser = Pick<UserDB, "email" | "password">;
