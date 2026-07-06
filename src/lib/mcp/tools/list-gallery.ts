import { defineTool } from "@lovable.dev/mcp-js";
import { readOnlySupabase } from "../supabase";

export default defineTool({
  name: "list_gallery",
  title: "List illustration gallery",
  description:
    "List the naturalist illustration gallery entries (entomology / botany) with title and description.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await readOnlySupabase()
      .from("galeria")
      .select("id, titulo, descripcion, imagen_url, orden")
      .order("orden", { ascending: true });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { gallery: data ?? [] },
    };
  },
});
