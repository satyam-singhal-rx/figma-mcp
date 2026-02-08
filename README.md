# Figma MCP

A utility to fetch Figma frame data and reduce it to essential properties for development.

## Prerequisites

- Node.js (v18+)
- A Figma Personal Access Token

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your Figma token:

```bash
FIGMA_TOKEN=your_figma_personal_access_token
```

To get a Figma token:
- Go to Figma → Settings → Account → Personal access tokens
- Generate a new token and copy it

## Usage

### Step 1: Configure the target frame

Edit `fetch-figma.js` and update these values:

```javascript
const FILE_KEY = "your_file_key";  // From the Figma URL
const NODE_ID = "27729:93910";      // Node ID with colon separator
```

**Finding these values:**
- **FILE_KEY**: In your Figma URL `https://www.figma.com/file/5P0b5DsHL4adbsvcHFhdEz/...`, the key is `5P0b5DsHL4adbsvcHFhdEz`
- **NODE_ID**: Right-click a frame in Figma → "Copy link" → the URL contains `node-id=27729-93910`. Replace the dash with a colon: `27729:93910`

### Step 2: Fetch the frame data

```bash
node fetch-figma.js
```

```bash
node fetch-figma.js > figma.json
```

This saves the full Figma node data to `frame.json`.

### Step 3: Reduce the JSON

```bash
node reduce-frame.js
```

This creates `frame.reduced.json` with only essential properties:
- Layout (width, height, x, y)
- Auto layout settings (layoutMode, alignment, spacing, padding)
- Visual properties (fills, strokes, cornerRadius)
- Text content and styles
- Nested children structure

## Output

The reduced JSON includes:

| Property | Description |
|----------|-------------|
| `id`, `name`, `type` | Node identification |
| `width`, `height`, `x`, `y` | Bounding box dimensions |
| `layoutMode` | Auto layout direction (HORIZONTAL/VERTICAL) |
| `primaryAxisAlignItems` | Main axis alignment |
| `counterAxisAlignItems` | Cross axis alignment |
| `itemSpacing` | Gap between children |
| `padding` | Padding on all sides |
| `fills` | Background colors |
| `strokes` | Border styles |
| `cornerRadius` | Border radius |
| `characters` | Text content |
| `textStyle` | Font properties |
| `children` | Nested child nodes |

## License

MIT
