# CipherVault backend

CipherVault is a simple password manager built with React with TypeScript as frontend and Express with TypeScript and SQLite as backend.

## Getting started

- Make sure you have either [Bun](https://bun.sh/) or [NodeJS](https://nodejs.org/) and [SQLite](https://sqlite.org/) installed on your device.

- Clone this repository:

```sh
git clone <repo-url>
```

- Install all the necessary dependencies:

```sh
bun install # or npm install
```

- Setup environment variables as given in `.env.example` file.
- Dump the table schema in your Database file:

```sh
sqlite3 cipher_vault.db < ./utils/schema.sql
```

- Run the project with:

```sh
bun start # or npm start
```
