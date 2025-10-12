import type { Request, Response } from "express";
import type { CreateCredential, UpdateCredential } from "../@types/credential";
import { CredentialManager } from "../db/credential";

const credentialManager = new CredentialManager();

export function create(req: Request, res: Response) {
  const userID = req.headers["user-id"];
  const creds = req.body as CreateCredential;
  creds.user_id = userID as string;

  const c = credentialManager.createCredentials(creds);
  if (c === null) {
    return res.status(500).json({
      status: "failed",
      message: "Failed to insert record",
    });
  }

  res.status(201).json({
    status: "success",
    message: "Credentials saved",
    payload: { credential: c },
  });
}

export function index(req: Request, res: Response) {
  const userID = req.headers["user-id"];
  const userCreds = credentialManager.getCredentialsByUserID(userID as string);

  return res.json({
    status: "success",
    payload: { credentials: userCreds },
  });
}

export function show(req: Request, res: Response) {
  const credentialID = req.params["id"];

  if (credentialID === undefined) {
    return res.status(400).json({
      status: "failed",
      message: "Please provide a credential ID",
    });
  }

  const c = credentialManager.getCredentialByID(credentialID);

  if (c === null) {
    return res.status(404).json({
      status: "failed",
      message: "Credentials not found",
    });
  }

  res.json({
    status: "success",
    message: "Credentials found",
    payload: { credential: c },
  });
}

export function update(req: Request, res: Response) {
  const userID = req.headers["user-id"];

  const credentialID = req.params["id"];
  if (credentialID === undefined) {
    return res.status(400).json({
      status: "failed",
      message: "Please provide a credential ID",
    });
  }

  const c = credentialManager.getCredentialByID(credentialID);

  if (c === null) {
    return res.status(404).json({
      status: "failed",
      message: "Credentials not found",
    });
  }

  if (c.user_id !== userID) {
    return res.status(401).json({
      status: "failed",
      message: "You are unauthorized",
    });
  }

  const updateCredentialData: UpdateCredential = {
    cred_type: req.body["cred_tye"],
    cred_value: req.body["cred_value"],
    comment: req.body["comment"],
    password: req.body["password"],
  };

  const updatedCreds = credentialManager.updateCredential(
    updateCredentialData,
    credentialID
  );

  if (updatedCreds === null) {
    return res.status(500).json({
      status: "failed",
      message: "Something went wrong",
    });
  }

  res.json({
    status: "success",
    message: "Credential updated successfully",
    payload: { credential: updatedCreds },
  });
}

export function destroy(req: Request, res: Response) {
  const userID = req.headers["user-id"];
  const credentialID = req.params["id"];

  if (credentialID === undefined) {
    return res.status(400).json({
      status: "failed",
      message: "Please provide a credential ID",
    });
  }
  const c = credentialManager.getCredentialByID(credentialID);

  if (c === null) {
    return res.status(404).json({
      status: "failed",
      message: "Credentials not found",
    });
  }

  if (c.user_id !== userID) {
    return res.status(401).json({
      status: "failed",
      message: "You are unauthorized",
    });
  }

  const err = credentialManager.deleteCredential(c.id);
  if (err !== null) {
    return res.status(500).json({
      status: "failed",
      message: err,
    });
  }

  return res.status(204).json();
}

export default { create, destroy, index, show, update };
