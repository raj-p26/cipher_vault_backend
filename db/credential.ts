import { file } from "bun";
import Database from "bun:sqlite";
import crypto from "crypto";
import { v4 as uuidV4 } from "uuid";
import { DB_NAME, ENCRYPTION_KEY, SECRET_IV } from "../utils/env";
import type { CreateCredential, CreateCredentialDB, Credential, UpdateCredential } from "../@types/credential";

export class CredentialManager {
  db: Database;
  private static schemaDumped: boolean = false;

  private key: string;
  private encryptionIV: string;

  constructor() {
    this.db = new Database(DB_NAME);
    this.key = crypto.createHash('sha512')
      .update(ENCRYPTION_KEY)
      .digest('hex')
      .substring(0, 32);
    this.encryptionIV = crypto.createHash('sha512')
      .update(SECRET_IV)
      .digest('hex')
      .substring(0, 16);

    if (!CredentialManager.schemaDumped) {
      const schemaFile = file("./utils/schema.sql");
      schemaFile.text()
        .then((schema) => {
          this.db.run(schema);
        });
    }
  }

  private encrypt(data: string) {
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.key,
      this.encryptionIV
    );

    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64');
  }

  private decrypt(data: string) {
    const buff = Buffer.from(data, 'base64');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.key,
      this.encryptionIV
    );

    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    );
  }

  createCredentials(credentials: CreateCredential): Credential|null {
    const encryptedCredentials: CreateCredentialDB = {
      $id: uuidV4(),
      $domain: this.encrypt(credentials.domain),
      $email: this.encrypt(credentials.email),
      $password: this.encrypt(credentials.password),
      $user_id: credentials.user_id,
    };

    const insertedCredentials = this.db
      .prepare<Credential, CreateCredentialDB>("INSERT INTO credentials (id, user_id, domain, email, password) VALUES ($id, $user_id, $domain, $email, $password) RETURNING *;")
      .get({ ...encryptedCredentials });

    if (insertedCredentials === null) return null;

    const c: Credential = {
      ...insertedCredentials,
      domain: this.decrypt(insertedCredentials.domain),
      email: this.decrypt(insertedCredentials.email),
      password: this.decrypt(insertedCredentials.password),
    };

    return c;
  }

  getCredentialsByUserID(userID: string): Credential[] {
    const credentials = this.db
      .prepare<Credential, string>("SELECT * FROM credentials WHERE user_id=?;")
      .all(userID);

    return credentials.map(c => ({
      ...c,
      domain: this.decrypt(c.domain),
      email: this.decrypt(c.email),
      password: this.decrypt(c.password),
    }));
  }

  getCredentialByID(id: string): Credential|null {
    const c = this.db
      .prepare<Credential, string>("SELECT * FROM credentials WHERE id=?;")
      .get(id);

    if (c === null) return null;

    return {
      ...c,
      domain: this.decrypt(c.domain),
      email: this.decrypt(c.email),
      password: this.decrypt(c.password),
    };
  }

  updateCredential(c: UpdateCredential, id: string) {
    const cred = this.db.prepare<Credential, string>(
      "SELECT * FROM credentials WHERE id=?;"
    ).get(id);

    if (cred === null) return null;

    let bindargs = [];
    let sql = "UPDATE credentials SET ";
    Object.entries(c).forEach(([k, v]) => {
      if (v !== undefined) {
        sql += `${k}=?,`;
        bindargs.push(this.encrypt(v));
      }
    });
    sql += "updated_at=CURRENT_TIMESTAMP WHERE id=? RETURNING *;";
    bindargs.push(id);

    const updatedCredential = this.db
      .prepare<Credential,string[]>(sql)
      .get(...bindargs);

    if (updatedCredential === null) return null;

    return {
      ...updatedCredential,
      domain: this.decrypt(updatedCredential.domain),
      email: this.decrypt(updatedCredential.email),
      password: this.decrypt(updatedCredential.password),
    };
  }

  deleteCredential(id: string): string|null {
    const cred = this.db.prepare<Credential, string>(
      "SELECT * FROM credentials WHERE id=?;"
    ).get(id);

    if (cred === null) return "Credentials not found";

    const res = this.db.prepare("DELETE FROM credentials WHERE id=?;").run(id);

    return res.changes !== 0 ? null : "Unable to delete";
  }

  clearTable() {
    this.db.run("DELETE FROM credentials;");
  }
}
