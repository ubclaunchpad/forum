import { z } from "../deps.ts";


export const uuidSchema = z.string().uuid();

export type UUID = z.infer<typeof uuidSchema>;
