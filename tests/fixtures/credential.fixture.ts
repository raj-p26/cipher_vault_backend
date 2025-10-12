import { v4 as uuidV4 } from "uuid";
import type { CreateCredential } from "../../@types/credential";
import { CredentialManager } from "../../db/credential";

const defaultUserID = uuidV4();
const defaultCredential: CreateCredential = {
  user_id: defaultUserID,
  cred_type: "domain",
  cred_value: "https://www.example.com",
  password: "test-password",
};

const credentialManager = new CredentialManager();

function create(creds: CreateCredential = defaultCredential) {
  return credentialManager.createCredentials(creds);
}

export default {
  defaultUserID,
  defaultCredential,
  create,
};
