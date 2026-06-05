import type { Localized } from "./i18n";

import heroCartography from "@/assets/hero-cartography.jpg";
import galleryBeetle from "@/assets/gallery-beetle.jpg";
import galleryBotanical from "@/assets/gallery-botanical.jpg";
import galleryButterfly from "@/assets/gallery-butterfly.jpg";
import workWatershed from "@/assets/work-watershed.jpg";
import workLandcover from "@/assets/work-landcover.jpg";
import workRelief from "@/assets/work-relief.jpg";

export const assets = {
  heroCartography,
  galleryBeetle,
  galleryBotanical,
  galleryButterfly,
  workWatershed,
  workLandcover,
  workRelief,
};

export const site = {
  name: "Planispherium Nova",
  email: "hola@planispheriumnova.com",
};

export interface Service {
  slug: string;
  icon: string;
  title: Localized;
  summary: Localized;
  points: Localized[];
}

export const services: Service[] = [
  {
    slug: "cartografia",
    icon: "Map",
    title: { es: "Cartografía temática", en: "Thematic Cartography" },
    summary: {
      es: "Mapas temáticos especializados: medio físico, socioeconómico, hidrología, división política, infraestructura y más.",
      en: "Specialized thematic maps: physical environment, socioeconomic, hydrology, political boundaries, infrastructure, and more.",
    },
    points: [
      { es: "Medio físico y relieve", en: "Physical environment and relief" },
      { es: "Socioeconómico y demográfico", en: "Socioeconomic and demographic" },
      { es: "Hidrología y drenaje", en: "Hydrology and drainage" },
      { es: "División política y administrativa", en: "Political and administrative boundaries" },
      { es: "Infraestructura y transporte", en: "Infrastructure and transport" },
    ],
  },
  {
    slug: "gis",
    icon: "Layers",
    title: { es: "Sistemas de Información Geográfica", en: "Geographic Information Systems" },
    summary: {
      es: "Diseño, análisis y gestión de datos espaciales para decisiones bien fundadas.",
      en: "Spatial data design, analysis, and management for well-grounded decisions.",
    },
    points: [
      { es: "Análisis espacial y modelado", en: "Spatial analysis and modeling" },
      { es: "Bases de datos geográficas (PostGIS)", en: "Geographic databases (PostGIS)" },
      { es: "Automatización de flujos de trabajo", en: "Workflow automation" },
    ],
  },
  {
    slug: "teledeteccion",
    icon: "Satellite",
    title: { es: "Teledetección", en: "Remote Sensing" },
    summary: {
      es: "Procesamiento de imágenes satelitales y aéreas para monitorear el territorio.",
      en: "Satellite and aerial imagery processing to monitor the landscape.",
    },
    points: [
      { es: "Clasificación de coberturas", en: "Land cover classification" },
      { es: "Índices de vegetación y cambio", en: "Vegetation and change indices" },
      { es: "Monitoreo multitemporal", en: "Multi-temporal monitoring" },
    ],
  },
  {
    slug: "consultoria",
    icon: "Leaf",
    title: { es: "Consultoría Ambiental", en: "Environmental Consulting" },
    summary: {
      es: "Profesionales competentes gestionan tu proyecto aquí. Trámites y estudios ambientales especializados ante ASEA, SEMARNAT y SEDEMA CDMX.",
      en: "Competent professionals manage your project here. Specialized environmental permits and studies before ASEA, SEMARNAT, and SEDEMA CDMX.",
    },
    points: [
      { es: "Manifestación de Impacto Ambiental (ASEA · SEMARNAT)", en: "Environmental Impact Statement (ASEA · SEMARNAT)" },
      { es: "Estudios Técnicos Justificativos para Cambio de Uso de Suelo en Terrenos Forestales", en: "Technical Justification Studies for Land-Use Change in Forestlands" },
      { es: "Trámites ambientales en SEDEMA CDMX", en: "Environmental permits at SEDEMA CDMX" },
    ],
  },
];

export interface Project {
  slug: string;
  image: string;
  title: Localized;
  category: Localized;
  description: Localized;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "relieve-montana",
    image: workRelief,
    featured: true,
    title: { es: "Modelo de relieve montañoso", en: "Mountain Relief Model" },
    category: { es: "Cartografía · DEM", en: "Cartography · DEM" },
    description: {
      es: "Sube tu shapefile o KML de cualquier parte del mundo y obtén tu recorte DEM con curvas de nivel. Para México, resolución mejorada con datos nacionales. Para el resto del mundo, cobertura global vía SRTM / Copernicus 30 m.",
      en: "Upload your shapefile or KML from anywhere in the world and get your DEM clip with contour lines. For Mexico, enhanced resolution with national data. For the rest of the world, global coverage via SRTM / Copernicus 30 m.",
    },
  },
  {
    slug: "cuenca-hidrografica",
    image: workWatershed,
    featured: true,
    title: { es: "Atlas de cuenca hidrográfica", en: "Watershed Atlas" },
    category: { es: "Hidrología · SIG", en: "Hydrology · GIS" },
    description: {
      es: "Delimitación de cuencas, red de drenaje y zonas de recarga para gestión del agua.",
      en: "Basin delineation, drainage network, and recharge zones for water management.",
    },
  },
  {
    slug: "cobertura-suelo",
    image: workLandcover,
    featured: true,
    title: { es: "Clasificación de coberturas", en: "Land Cover Classification" },
    category: { es: "Teledetección", en: "Remote Sensing" },
    description: {
      es: "Mapa de usos del suelo derivado de imágenes satelitales multitemporales.",
      en: "Land-use map derived from multi-temporal satellite imagery.",
    },
  },
];

export type GalleryKind = "mapa" | "svg";

export interface Illustration {
  slug: string;
  image: string;
  kind: GalleryKind;
  title: Localized;
  source: Localized;
  /** Link to the store where this product is sold. */
  storeUrl?: string;
}

export const illustrations: Illustration[] = [
  {
    slug: "escarabajo",
    image: galleryBeetle,
    kind: "svg",
    title: { es: "Escarabajo", en: "Beetle" },
    source: { es: "Lámina entomológica, s. XIX", en: "Entomology plate, 19th c." },
    storeUrl: "#",
  },
  {
    slug: "planta-floral",
    image: galleryBotanical,
    kind: "svg",
    title: { es: "Planta en flor", en: "Flowering Plant" },
    source: { es: "Lámina botánica, s. XIX", en: "Botanical plate, 19th c." },
    storeUrl: "#",
  },
  {
    slug: "mariposa",
    image: galleryButterfly,
    kind: "svg",
    title: { es: "Mariposa", en: "Butterfly" },
    source: { es: "Lámina entomológica, s. XIX", en: "Entomology plate, 19th c." },
    storeUrl: "#",
  },
  {
    slug: "mapa-relieve",
    image: workRelief,
    kind: "mapa",
    title: { es: "Lámina de relieve montañoso", en: "Mountain Relief Print" },
    source: { es: "Mapa decorativo · DEM", en: "Decorative map · DEM" },
    storeUrl: "#",
  },
  {
    slug: "mapa-cuenca",
    image: workWatershed,
    kind: "mapa",
    title: { es: "Atlas de cuenca", en: "Watershed Atlas Print" },
    source: { es: "Mapa decorativo · Hidrología", en: "Decorative map · Hydrology" },
    storeUrl: "#",
  },
  {
    slug: "mapa-coberturas",
    image: workLandcover,
    kind: "mapa",
    title: { es: "Coberturas del suelo", en: "Land Cover Print" },
    source: { es: "Mapa decorativo · Teledetección", en: "Decorative map · Remote Sensing" },
    storeUrl: "#",
  },
];


export interface LayerItem {
  slug: string;
  title: Localized;
  region: Localized;
  description: Localized;
  formats: string[];
}

export const layers: LayerItem[] = [
  {
    slug: "red-hidrografica",
    title: { es: "Red hidrográfica", en: "Hydrographic Network" },
    region: { es: "Escala regional", en: "Regional scale" },
    description: {
      es: "Ríos, quebradas y cuerpos de agua digitalizados y topológicamente corregidos.",
      en: "Rivers, streams, and water bodies, digitized and topologically corrected.",
    },
    formats: [".shp", ".gpkg", ".kmz"],
  },
  {
    slug: "curvas-nivel",
    title: { es: "Curvas de nivel", en: "Contour Lines" },
    region: { es: "Alta resolución", en: "High resolution" },
    description: {
      es: "Curvas de nivel derivadas de DEM, listas para análisis y cartografía.",
      en: "DEM-derived contour lines, ready for analysis and cartography.",
    },
    formats: [".shp", ".dxf", ".kmz"],
  },
  {
    slug: "cobertura-vegetal",
    title: { es: "Cobertura vegetal", en: "Vegetation Cover" },
    region: { es: "Clasificación supervisada", en: "Supervised classification" },
    description: {
      es: "Polígonos de cobertura y uso del suelo con atributos validados en campo.",
      en: "Land cover and land-use polygons with field-validated attributes.",
    },
    formats: [".shp", ".gpkg"],
  },
  {
    slug: "limites-administrativos",
    title: { es: "Límites administrativos", en: "Administrative Boundaries" },
    region: { es: "Multinivel", en: "Multi-level" },
    description: {
      es: "Divisiones administrativas armonizadas para mapas base y reportes.",
      en: "Harmonized administrative divisions for base maps and reports.",
    },
    formats: [".shp", ".geojson", ".kmz"],
  },
];

export interface Post {
  slug: string;
  date: string;
  title: Localized;
  excerpt: Localized;
  body: Localized[];
}

export const posts: Post[] = [
  {
    slug: "por-que-importan-los-mapas",
    date: "2026-05-12",
    title: { es: "Por qué los mapas todavía importan", en: "Why maps still matter" },
    excerpt: {
      es: "Un mapa bien hecho no solo muestra dónde están las cosas: revela relaciones.",
      en: "A well-made map shows more than where things are — it reveals relationships.",
    },
    body: [
      {
        es: "Cada mapa es una decisión sobre qué incluir y qué omitir. En esa decisión vive la honestidad del cartógrafo.",
        en: "Every map is a decision about what to include and what to leave out. The cartographer's honesty lives in that decision.",
      },
      {
        es: "Combinar datos espaciales con un diseño cuidadoso convierte información compleja en algo legible y útil.",
        en: "Combining spatial data with careful design turns complex information into something legible and useful.",
      },
    ],
  },
  {
    slug: "teledeteccion-en-campo",
    date: "2026-04-03",
    title: { es: "Teledetección con los pies en el campo", en: "Remote sensing with feet on the ground" },
    excerpt: {
      es: "Las imágenes satelitales son poderosas, pero la verdad sigue estando en el terreno.",
      en: "Satellite imagery is powerful, but the truth still lives on the ground.",
    },
    body: [
      {
        es: "La validación en campo es lo que distingue un análisis confiable de una suposición bonita.",
        en: "Field validation is what separates a reliable analysis from a pretty guess.",
      },
      {
        es: "Cada punto de control aproxima el mapa a la realidad que pretende representar.",
        en: "Every ground-control point brings the map closer to the reality it aims to represent.",
      },
    ],
  },
];
