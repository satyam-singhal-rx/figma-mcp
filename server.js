import express from "express";
import axios from "axios";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

// Convert Figma RGBA (0-1) to hex
function rgbaToHex(color) {
  if (!color) return null;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  if (color.a !== undefined && color.a < 1) {
    return `${hex}${Math.round(color.a * 255).toString(16).padStart(2, "0")}`;
  }
  return hex;
}

// Remove keys with undefined, null, or empty values
function clean(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) continue;
    result[key] = value;
  }
  return result;
}

function reduceNode(node) {
  if (!node) return null;

  const box = node.absoluteBoundingBox;

  // Build padding only if values exist
  const padding = clean({
    l: node.paddingLeft,
    r: node.paddingRight,
    t: node.paddingTop,
    b: node.paddingBottom,
  });

  // Extract fills as hex colors
  const fills = node.fills
    ?.filter((f) => f.visible !== false && f.type === "SOLID")
    .map((f) => rgbaToHex(f.color))
    .filter(Boolean);

  // Extract stroke colors
  const strokes = node.strokes
    ?.filter((s) => s.visible !== false && s.type === "SOLID")
    .map((s) => rgbaToHex(s.color))
    .filter(Boolean);

  // Reduce children
  const children = node.children?.map(reduceNode).filter(Boolean);

  return clean({
    id: node.id,
    name: node.name,
    type: node.type,
    w: box?.width ? Math.round(box.width) : undefined,
    h: box?.height ? Math.round(box.height) : undefined,
    x: box?.x ? Math.round(box.x) : undefined,
    y: box?.y ? Math.round(box.y) : undefined,
    layout: node.layoutMode,
    align: node.primaryAxisAlignItems,
    crossAlign: node.counterAxisAlignItems,
    gap: node.itemSpacing,
    padding: Object.keys(padding).length ? padding : undefined,
    fills,
    strokes,
    strokeWeight: node.strokeWeight,
    radius: node.cornerRadius,
    text: node.characters,
    font: node.style?.fontFamily,
    fontSize: node.style?.fontSize,
    fontWeight: node.style?.fontWeight,
    children,
  });
}

function parseFigmaUrl(url) {
  // Match: https://www.figma.com/file/FILE_KEY/... or https://www.figma.com/design/FILE_KEY/...
  const fileMatch = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
  if (!fileMatch) {
    throw new Error("Invalid Figma URL. Expected format: https://www.figma.com/design/FILE_KEY/...");
  }
  const fileKey = fileMatch[2];

  // Match: node-id=123-456 or node-id=123:456
  const nodeMatch = url.match(/node-id=([0-9]+[-:][0-9]+)/);
  if (!nodeMatch) {
    throw new Error("No node-id found in URL. Right-click a frame in Figma and copy the link.");
  }
  // Convert dash to colon if needed
  const nodeId = nodeMatch[1].replace("-", ":");

  return { fileKey, nodeId };
}

app.post("/api/reduce", async (req, res) => {
  const { figmaUrl, token } = req.body;

  if (!figmaUrl || !token) {
    return res.status(400).json({ error: "Missing figmaUrl or token" });
  }

  try {
    const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);

    console.log("CALLING FIGMA API NOW");
    const response = await axios.get(
      `https://api.figma.com/v1/files/${fileKey}/nodes`,
      {
        headers: { "X-Figma-Token": token },
        params: { ids: nodeId },
      }
    );

    const nodeData = response.data.nodes[nodeId];
    if (!nodeData) {
      return res.status(404).json({ error: "Node not found in Figma file" });
    }

    const documentNode = nodeData.document ?? nodeData;
    const reduced = reduceNode(documentNode);

    res.json(reduced);
  } catch (err) {
    if (err.response?.status === 403) {
      return res.status(403).json({ error: "Invalid Figma token or no access to this file" });
    }
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "Figma file not found" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
