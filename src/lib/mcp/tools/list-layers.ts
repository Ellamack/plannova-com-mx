import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { readOnlySupabase } from "../supabase";

export default defineTool({
  name: "list_layers",
  title: "List GIS layers",
  description:
    "List the catalog of available GIS map layers (.shp, .kml, .kmz, .geojson). Optionally filter by layer type.",
  inputSchema: {
    tipo: z
      .string()
      .optional()
      .describe("Optional layer type to filter by (e.g. shp, kml, kmz, geojson)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ tipo }) => {
    let query = readOnlySupabase()
      .from("capas")
      .select("id, nombre, descripcion, tipo, tamano, fecha_subida")
      .order("fecha_subida", { ascending: false });
    if (tipo) query = query.eq("tipo", tipo);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { layers: data ?? [] },
    };
  },
});
