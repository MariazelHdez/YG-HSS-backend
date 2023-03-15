import * as dotenv from "dotenv";

let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `.env.test`;
    break;
  case "production":
    path = `.env.production`;
    break;
  default:
    path = `.env.development`;
}
dotenv.config({ path: path });


export const API_PORT = parseInt(process.env.API_PORT || "3000");
export const FRONTEND_URL = process.env.FRONTEND_URL || "";
export const AUTH_REDIRECT = process.env.AUTH_REDIRECT || process.env.FRONTEND_URL || "";
export const NODE_ENV = process.env.NODE_ENV;

export const DB_USER = process.env.DB_USER || '';
export const DB_PASS = process.env.DB_PASS || '';
export const DB_HOST = process.env.DB_HOST || '';
export const DB_PORT = process.env.DB_PORT || '';
export const DB_NAME = process.env.DB_NAME || '';

export const SCHEMA_CONSTELLATION = process.env.SCHEMA_CONSTELLATION || '';
export const SCHEMA_MIDWIFERY = process.env.SCHEMA_MIDWIFERY || '';
export const SCHEMA_HIPMA = process.env.SCHEMA_HIPMA || '';
export const SCHEMA_GENERAL = process.env.SCHEMA_GENERAL || '';


export const DB_CONFIG_CONSTELLATION = {
  client: 'oracledb',
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    port: parseInt(DB_PORT),
    schema: SCHEMA_CONSTELLATION,
    useNullAsDefault: true,
  },
};

export const DB_CONFIG_MIDWIFERY = {
  client: 'oracledb',
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  },
};

export const DB_CONFIG_HIPMA = {
  client: 'oracledb',
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  },

};

export const DB_CONFIG_GENERAL = {
  client: 'oracledb',
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  }
};
