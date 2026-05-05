import sharp from "sharp";
import HeadPicsIDs from "../constants/headpics.json";
import { createProgressBar } from "../utils/progress";
import { logger } from "../utils/logger";
import fs from "node:fs/promises";
import fsSync from "fs";
import path from "path";
import { TeamData } from "./draw";

class Converter {
  #folders = {
    head: "HeadPics",
    glowall: "GloowallPics",
    backpack: "BackPackPics",
  };

  #sizes = { head: 110, glowall: 1000, backpack: 1000 };

  async run(
    files: string[],
    options: any,
    cwd: string,
  ): Promise<{
    successFiles: string[];
    errorFiles: string[];
    drawTableData: TeamData;
  }> {
    const arrayID = Object.values(HeadPicsIDs)
      .map((item) => item.headPics)
      .flat();
    if (files.length > arrayID.length) {
      throw new Error(`Too many file! Maximum is ${arrayID.length} photos.`);
    }
    const paths = Object.values(this.#folders).map((f) => path.join(cwd, f));
    paths.forEach(
      (p) => !fsSync.existsSync(p) && fsSync.mkdirSync(p, { recursive: true }),
    );

    const bar = createProgressBar();
    bar.start(files.length, 0);

    const successFiles: string[] = [];
    const errorFiles: string[] = [];
    const drawTableData: TeamData = [];

    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (file, index) => {
          const currentIndex = i + index;
          const id = arrayID[currentIndex];
          const inputPath = path.join(cwd, file);

          try {
            const imageBuffer = await fs.readFile(inputPath);
            const pipeline = sharp(imageBuffer);

            await Promise.all([
              pipeline
                .clone()
                .resize(this.#sizes.head)
                .toFile(path.join(cwd, this.#folders.head, `${id}.png`)),
              pipeline
                .clone()
                .resize(this.#sizes.glowall)
                .toFile(path.join(cwd, this.#folders.glowall, `${id}.png`)),
              pipeline
                .clone()
                .resize(this.#sizes.backpack)
                .toFile(path.join(cwd, this.#folders.backpack, `${id}.png`)),
            ]);

            drawTableData.push({
              teamName: file.split(".").slice(0, -1).join("."),
              charName:
                HeadPicsIDs[id as keyof typeof HeadPicsIDs].characterName || "",
              logoPath: path.join(cwd, file),
              headPicPath: path.join(cwd, this.#folders.glowall, `${id}.png`),
            });

            successFiles.push(file);
          } catch (err) {
            errorFiles.push(file);
          } finally {
            bar.increment();
          }
        }),
      );
    }

    bar.stop();
    logger.success(
      `Xử lý xong: ${successFiles.length} thành công, ${errorFiles.length} thất bại.`,
    );

    return { successFiles, errorFiles, drawTableData };
  }
}

export default new Converter();
