export type Credential = {
  id: string;
  cred_type: string;
  cred_value?: string;
  password: string;
  user_id: string;
  comment?: string;
  inserted_at: string;
  updated_at: string;
  pinned?: 0 | 1;
};

export type CreateCredential = Omit<
  Credential,
  "id" | "inserted_at" | "updated_at"
>;

export type CreateCredentialDB = {
  [T in keyof CreateCredential as `\$${T}`]: CreateCredential[T];
} & { $id: string };

export type UpdateCredential = Partial<Omit<CreateCredential, "user_id">>;

export type UpdateCredentialDB = {
  [T in keyof UpdateCredential as `\$${T}`]: UpdateCredential[T];
};
