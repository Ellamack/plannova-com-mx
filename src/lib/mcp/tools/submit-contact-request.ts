import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "submit_contact_request",
  title: "Submit a contact / DEM request",
  description:
    "Send a contact message or DEM processing request to Planispherium Nova. Use this to request a DEM clip, contour lines, or geospatial services for an area.",
  inputSchema: {
    name: z.string().min(1).describe("Full name of the person making the request."),
    email: z.string().email().describe("Contact email address."),
    message: z.string().min(1).describe("Details of the request or message."),
    company: z.string().optional().describe("Company or organization (optional)."),
    phone: z.string().optional().describe("Phone number (optional)."),
    contourInterval: z
      .number()
      .int()
      .optional()
      .describe("Desired contour line separation in meters (default 100)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, email, message, company, phone, contourInterval }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name,
      email,
      message,
      company: company || null,
      phone: phone || null,
      contour_interval: contourInterval ?? 100,
      locale: "es",
    });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: "Your request has been submitted successfully." }],
      structuredContent: { ok: true },
    };
  },
});
