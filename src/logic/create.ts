import path from "node:path";
import { getValidImages } from "../cores/checkImage";
import Converter from "../cores/converter";
import { createTeamTableImage } from "../cores/draw";
import { logger } from "../utils/logger";

interface CreateOptions {
  output?: string;
  league?: boolean;
  padding?: number;
}

export default async function CreateLogicCommand(options: CreateOptions) {
  const { output, league, padding } = options;
  const workingPath = process.cwd();

  const validImageFiles = await getValidImages(workingPath);

  const drawTableDataRes = await Converter.run(
    validImageFiles.map((file) => file.name),
    { leagueFlag: league || false, padding: padding },
    workingPath,
  );

  try {
    await createTeamTableImage(
      drawTableDataRes.drawTableData,
      path.join(workingPath, "team_table.png"),
    );

    logger.success("Team table image created successfully!");
  } catch (error) {
    logger.error(
      "Failed to create team table image: " + (error as Error).message,
    );
  }
}
