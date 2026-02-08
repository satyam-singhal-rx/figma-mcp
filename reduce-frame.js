import fs from "fs";

const raw = JSON.parse(fs.readFileSync("frame.json", "utf8"));

function reduceNode(node) {
  if (!node) return null;

  return {
    id: node.id,
    name: node.name,
    type: node.type,

    // layout
    width: node.absoluteBoundingBox?.width,
    height: node.absoluteBoundingBox?.height,
    x: node.absoluteBoundingBox?.x,
    y: node.absoluteBoundingBox?.y,

    // auto layout
    layoutMode: node.layoutMode,
    primaryAxisAlignItems: node.primaryAxisAlignItems,
    counterAxisAlignItems: node.counterAxisAlignItems,
    itemSpacing: node.itemSpacing,
    padding: {
      left: node.paddingLeft,
      right: node.paddingRight,
      top: node.paddingTop,
      bottom: node.paddingBottom,
    },

    // visuals
    fills: node.fills?.map(f => ({
      type: f.type,
      color: f.color,
    })),

    strokes: node.strokes,
    cornerRadius: node.cornerRadius,

    // text
    characters: node.characters,
    textStyle: node.style,

    // recurse
    children: node.children?.map(reduceNode),
  };
}

// Figma node response shape
const documentNode = raw.document ?? raw;
const reduced = reduceNode(documentNode);

fs.writeFileSync(
  "frame.reduced.json",
  JSON.stringify(reduced, null, 2)
);

console.log("Reduced JSON saved → frame.reduced.json");