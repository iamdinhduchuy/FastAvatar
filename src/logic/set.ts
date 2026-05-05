import fs from "fs";
import ConfigManager from "../cores/config";
import { logger } from "../utils/logger";

interface SetOptions {
  path?: string;
}

export default async function SetLogicCommand(options: SetOptions) {
  const { path } = options;

  if (!path)
    return logger.error("Please provide a path using the -p or --path option.");

  if(!fs.existsSync(path))
    return logger.error("The provided path does not exist.");

  if (!fs.lstatSync(path).isDirectory())
    return logger.error("The provided path is not a directory.");

  try {
    fs.accessSync(path, fs.constants.W_OK);
  } catch (err) {
    return logger.error("The provided path is not writable.");
  }

  try {
    const absolutePath = fs.realpathSync(path);
    ConfigManager.setDefaultGeneratePath(absolutePath);
    logger.success(`Default generate path saved: ${absolutePath}`);
  } catch {
    logger.error("Failed to set the default generate path.");
  }
}