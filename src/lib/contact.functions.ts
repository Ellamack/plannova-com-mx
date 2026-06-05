import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(1).max(2000),
  locale: z.enum(["es", "en"]).default("es"),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
      locale: data.locale,
    });
    if (error) {
      console.error("[contact] insert failed:", error.message);
      throw new Error("Failed to save message");
    }
    return { ok: true };
  });
