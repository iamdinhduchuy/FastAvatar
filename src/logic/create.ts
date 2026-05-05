import path from "node:path";
import { getValidImages } from "../cores/checkImage";
import Converter from "../cores/converter";
import { createTeamTableImage } from "../cores/draw";
import { logger } from "../utils/logger";
import ConfigManager from "../cores/config";

interface CreateOptions {
  output?: string;
  league?: boolean;
  padding?: number;
}

/**
 * 
 * The logic of this function is will be generate a team table in current working directory
 * All folder use for config like HeadPics, GloowallPics, BackPackPics, etc. should be in current working directory
 * The image of list will be generated in current working directory or the path set by user with `set` command
 * This not bug this a feature, because in Free Fire_64_Data has so much file of game, so we just only generate the team table in current working directory
 * author: @iamdinhduchuy
 * 
 */
export default async function CreateLogicCommand(options: CreateOptions) {
  const { output, league, padding } = options;
  const workingPath = process.cwd();
  const resultPath = output ? path.resolve(output) : ConfigManager.getDefaultGeneratePath();

  const validImageFiles = await getValidImages(workingPath);

  const drawTableDataRes = await Converter.run(
    validImageFiles.map((file) => file.name),
    { leagueFlag: league, padding: padding },
    resultPath,
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
