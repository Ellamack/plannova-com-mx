import { defineTool } from "@lovable.dev/mcp-js";
import { readOnlySupabase } from "../supabase";

export default defineTool({
  name: "list_services",
  title: "List services",
  description:
    "List the geospatial services offered by Planispherium Nova (cartography, GIS, remote sensing, environmental consulting).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await readOnlySupabase()
      .from("servicios")
      .select("id, nombre, descripcion, orden")
      .order("orden", { ascending: true });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { services: data ?? [] },
    };
  },
});
