import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title is too long"),
});

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title is too long"),

  content: z.string(),
});