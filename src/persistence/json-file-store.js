import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

async function ensureParentDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export class JsonFileStore {
  constructor(filePath, defaultValue) {
    this.filePath = filePath;
    this.defaultValue = defaultValue;
  }

  async initialize() {
    if (!(await exists(this.filePath))) {
      await this.write(this.defaultValue);
    }
  }

  async read() {
    await this.initialize();
    const content = await readFile(this.filePath, "utf8");
    return JSON.parse(content);
  }

  async write(value) {
    await ensureParentDir(this.filePath);
    await writeFile(this.filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    return value;
  }
}

export class JsonListStore extends JsonFileStore {
  constructor(filePath) {
    super(filePath, []);
  }

  async append(record) {
    const items = await this.read();
    items.push(record);
    await this.write(items);
    return record;
  }
}
