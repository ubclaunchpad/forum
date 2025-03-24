import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PermissionCheck, PermissionTree, Profile } from "./types/profiles";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PENDING_PREFIX = "pending_";
const LOCAL_PREFIX = "local_";

type IDType = "pending" | "local" | "none" | "other" | "uuid";

export function generateTempId(type: "pending" | "local" = "pending"): string {
  const random = Math.random().toString(36).substr(2, 9);
  if (type === "local") {
    return `${LOCAL_PREFIX}_${random}`;
  }
  return `${PENDING_PREFIX}_${random}`;
}

export function isPendingId(id: string): boolean {
  return id.toString().startsWith(PENDING_PREFIX);
}

export function getIdType(id?: string): IDType {
  if (!id) {
    return "none";
  }

  switch (true) {
    case id.toString().startsWith(PENDING_PREFIX):
      return "pending";
    case id.toString().startsWith(LOCAL_PREFIX):
      return "local";
    case /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    ):
      return "uuid";
    default:
      return "other";
  }
}

export function isIDTemporary(id?: string): boolean {
  const type = getIdType(id);

  if (["local", "pending", "none"].includes(type)) {
    return true;
  }
  return false;
}

export function hexToHSL(hex: string) {
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = (max + min) / 2;
  let s = (max + min) / 2;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Convert a date to a relative time string, such as
 * "a minute ago", "in 2 hours", "yesterday", "3 months ago", etc.
 * using Intl.RelativeTimeFormat
 */
export function getRelativeTimeString(
  date: Date | number,
  lang = navigator.language,
  relativeCutoff = 30, // Default 30 days
): string {
  const timeMs = typeof date === "number" ? date : date.getTime();
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Check if beyond cutoff
  if (Math.abs(deltaSeconds) > relativeCutoff * 86400) {
    const d = new Date(timeMs);
    return d.toLocaleDateString("en-GB"); // dd/mm/yyyy format
  }

  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity,
  ];
  const units: Intl.RelativeTimeFormatUnit[] = [
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "year",
  ];
  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds),
  );
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

export type Palette = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};
export function generatePalette(colour: string): Palette {
  const colorHSL = hexToHSL(colour);
  return {
    50: `hsl(${colorHSL.h}, ${colorHSL.s * 0.6}%, 94%)`,
    100: `hsl(${colorHSL.h}, ${colorHSL.s * 0.8}%, 86%)`,
    200: `hsl(${colorHSL.h}, ${colorHSL.s}%, 76%)`,
    300: `hsl(${colorHSL.h}, ${colorHSL.s}%, 66%)`,
    400: `hsl(${colorHSL.h}, ${colorHSL.s}%, 55%)`,
    500: `hsl(${colorHSL.h}, ${colorHSL.s}%, 50%)`,
    600: colour,
    700: `hsl(${colorHSL.h}, ${colorHSL.s}%, 35%)`,
    800: `hsl(${colorHSL.h}, ${colorHSL.s}%, 25%)`,
    900: `hsl(${colorHSL.h}, ${colorHSL.s * 1.1}%, 15%)`,
    950: `hsl(${colorHSL.h}, ${colorHSL.s * 1.2}%, 7%)`,
  };
}

export function getDisplayname(profile: Profile) {
  if (profile.display_name) {
    return profile.display_name;
  }

  return `${profile.first_name} ${profile.last_name}`;
}

type DeepEqualType =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: DeepEqualType }
  | DeepEqualType[];

export function isDeepEqual<T extends DeepEqualType>(x: T, y: T): boolean {
  if (x === y) {
    return true;
  }

  if (
    typeof x !== "object" ||
    x === null ||
    typeof y !== "object" ||
    y === null
  ) {
    return false;
  }

  // Handle arrays
  if (Array.isArray(x) && Array.isArray(y)) {
    if (x.length !== y.length) return false;
    return x.every((item, index) => isDeepEqual(item, y[index]));
  }

  // Handle objects (not arrays)
  if (!Array.isArray(x) && !Array.isArray(y)) {
    const xKeys = Object.keys(x);
    const yKeys = Object.keys(y as object);

    if (xKeys.length !== yKeys.length) return false;

    return xKeys.every((key) => {
      return (
        Object.prototype.hasOwnProperty.call(y, key) &&
        isDeepEqual(
          (x as { [key: string]: DeepEqualType })[key],
          (y as { [key: string]: DeepEqualType })[key],
        )
      );
    });
  }

  return false;
}

// Define permissions constants
export const PERMISSIONS = {
  CREATE_COURSE: {
    domain: null,
    subdomain: null,
    resource: "course",
    action: "create",
    modifier: "any",
  },
  SYSTEM_ADMIN: {
    domain: null,
    subdomain: null,
    resource: "system",
    action: "manage",
    modifier: "all",
  },
  CREATE_POST: {
    domain: null,
    subdomain: null,
    resource: "post",
    action: "create",
    modifier: "any",
  },
  MODIFY_COURSE: {
    domain: null,
    subdomain: null,
    resource: "course",
    action: "settings",
    modifier: "all",
  },
  SUSPEND_USER: {
    domain: null,
    subdomain: null,
    resource: "user",
    action: "suspend",
    modifier: "any",
  },
} as const;

export function hasPermission(
  tree: Record<string, Record<string, Record<string, boolean>>>,
  permission: PermissionCheck,
): boolean {
  return !!tree?.[permission.resource]?.[permission.action]?.[
    permission.modifier
  ];
}

export function checkPermissionInDomain(
  permissionTree: PermissionTree,
  permission: PermissionCheck,
  domain: string | null = "all",
  subdomain: string | null = "all",
): boolean {
  const domainKey = domain || "all";
  const subdomainKey = subdomain || "all";

  return hasPermission(
    permissionTree[domainKey]?.[subdomainKey] || {},
    permission,
  );
}

// const supportedAuthProviders =
//   process.env.NEXT_PUBLIC_SUPPORTED_AUTH_PROVIDERS?.split(",") || [];

export function isAuthProviderSupported(): boolean {
  // return supportedAuthProviders.includes(provider);
  return true;
}

export function supportedAnyAuthProvider(): boolean {
  return true;
  // console.log(supportedAuthProviders);
  // console.log(process.env.NEXT_PUBLIC_SUPPORTED_AUTH_PROVIDERS);
  // return supportedAuthProviders.length > 0;
}



