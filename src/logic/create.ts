import path from "node:path";
import { getValidImages } from "../cores/checkImage";
import Converter from "../cores/converter";
import { createTeamTableImage } from "../cores/draw";
import { logger } from "../utils/logger";

interface CreateOptions {
  output?: string;
  league?: boolean;
}

export default async function CreateLogicCommand(options: CreateOptions) {
  const { output, league } = options;
  const workingPath = process.cwd();

  const validImageFiles = await getValidImages(workingPath);

  const drawTableDataRes = await Converter.run(
    validImageFiles.map((file) => file.name),
    { leagueFlag: league || false },
    workingPath,
  );

  logger.info("Creating team table image...");

  try {
    createTeamTableImage(
      drawTableDataRes.drawTableData,
      path.join(workingPath, "team_table.png"),
    );
  } catch (error) {
    logger.error(
      "Failed to create team table image: " + (error as Error).message,
    );
  }
}
