import dotenv from "dotenv";

dotenv.config();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function getApiUrl() {
  if (API_BASE_URL) {
    return API_BASE_URL;
  } else {
    return "https://forumai.up.railway.app";
    // throw new Error("API_BASE_URL is not set");
  }
}

export const convertToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const convertObjectToSnakeCase = (obj: Record<string, unknown>) => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[convertToSnakeCase(key)] = obj[key];
      return acc;
    },
    {} as Record<string, unknown>,
  );
};
