import { defineMcp } from "@lovable.dev/mcp-js";
import listServices from "./tools/list-services";
import listProjects from "./tools/list-projects";
import listGallery from "./tools/list-gallery";
import listLayers from "./tools/list-layers";
import submitContactRequest from "./tools/submit-contact-request";

export default defineMcp({
  name: "planispherium-nova-mcp",
  title: "Planispherium Nova MCP",
  version: "0.1.0",
  instructions:
    "Tools for Planispherium Nova, a bilingual cartography & GIS studio. Read the catalog of services, portfolio projects, illustration gallery, and downloadable GIS layers (.shp/.kml/.kmz/.geojson), and submit contact or DEM-processing requests.",
  tools: [listServices, listProjects, listGallery, listLayers, submitContactRequest],
});
