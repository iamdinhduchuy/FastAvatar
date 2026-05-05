import fs from "fs";
import os from "os";
import path from "path";

type PersistedConfig = {
  defaultGeneratePath?: string;
};

class ConfigManager {
  private readonly configDir = path.join(os.homedir(), ".fastavatar");

  private readonly configFile = path.join(this.configDir, "config.json");

  private DEFAULT_GENERATE_PATH = process.cwd();

  constructor() {
    this.load();
  }

  private load() {
    if (!fs.existsSync(this.configFile)) return;

    try {
      const rawConfig = fs.readFileSync(this.configFile, "utf8");
      const parsedConfig = JSON.parse(rawConfig) as PersistedConfig;

      if (parsedConfig.defaultGeneratePath) {
        this.DEFAULT_GENERATE_PATH = parsedConfig.defaultGeneratePath;
      }
    } catch {
      this.DEFAULT_GENERATE_PATH = process.cwd();
    }
  }

  private save() {
    fs.mkdirSync(this.configDir, { recursive: true });
    fs.writeFileSync(
      this.configFile,
      JSON.stringify(
        { defaultGeneratePath: this.DEFAULT_GENERATE_PATH },
        null,
        2,
      ),
      "utf8",
    );
  }

  public getDefaultGeneratePath() {
    return this.DEFAULT_GENERATE_PATH;
  }

  public setDefaultGeneratePath(generatePath: string) {
    this.DEFAULT_GENERATE_PATH = generatePath;
    this.save();
  }

  public resetDefaultGeneratePath() {
    this.DEFAULT_GENERATE_PATH = process.cwd();
    this.save();
  }
}

export default new ConfigManager();