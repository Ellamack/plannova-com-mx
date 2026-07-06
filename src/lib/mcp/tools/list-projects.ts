import { defineTool } from "@lovable.dev/mcp-js";
import { readOnlySupabase } from "../supabase";

export default defineTool({
  name: "list_projects",
  title: "List portfolio projects",
  description:
    "List cartography and GIS portfolio projects, including their title, description, and technologies used.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await readOnlySupabase()
      .from("proyectos")
      .select("id, titulo, descripcion, tecnologias, imagen_url, orden")
      .order("orden", { ascending: true });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { projects: data ?? [] },
    };
  },
});
