import { z } from "zod";

export const shareDocumentSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email"),

  role: z.enum(["EDITOR", "VIEWER"]),
});