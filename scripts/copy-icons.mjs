import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "public/icons");
mkdirSync(dest, { recursive: true });
copyFileSync(join(root, "node_modules/lucide-static/icons/plus.svg"), join(dest, "plus.svg"));
