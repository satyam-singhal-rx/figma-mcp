import "dotenv/config";
import axios from "axios";
import fs from "fs";

const FILE_KEY = "5P0b5DsHL4adbsvcHFhdEz";
const NODE_ID = "27729:93910"; // IMPORTANT: colon, not dash

async function fetchFrame() {
  console.log("Fetching specific frame...");

  const res = await axios.get(
    `https://api.figma.com/v1/files/${FILE_KEY}/nodes`,
    {
      headers: {
        "X-Figma-Token": process.env.FIGMA_TOKEN,
      },
      params: {
        ids: NODE_ID,
      },
    }
  );

  fs.writeFileSync(
    "frame.json",
    JSON.stringify(res.data.nodes[NODE_ID], null, 2)
  );

  console.log("Saved frame.json");
}

fetchFrame();