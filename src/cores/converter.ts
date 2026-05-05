import sharp from "sharp";
import HeadPicsIDs from "../constants/headpics.json";
import { createProgressBar } from "../utils/progress";
import { logger } from "../utils/logger";
import fs from "node:fs/promises";
import fsSync from "fs";
import path from "path";
import { TeamData } from "./draw";

export interface ConverterOptions {
  leagueFlag?: boolean;
  padding?: number;
}

class Converter {
  #folders = {
    head: "HeadPics",
    gloowall: "GloowallPics",
    backpack: "BackPackPics",
  };

  #sizes = { head: 110, gloowall: 1000, backpack: 1000 };

  private async processImage(
    inputBuffer: Buffer,
    size: number,
    options: ConverterOptions,
    specificPadding: number = 0,
  ) {
    const { leagueFlag } = options;
    const pipeline = sharp(inputBuffer);

    if (leagueFlag) {
      const finalPadding = specificPadding;
      const contentSize = size - finalPadding * 2;

      return pipeline
        .trim()
        .resize({
          width: contentSize,
          height: contentSize,
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .extend({
          top: finalPadding,
          bottom: finalPadding,
          left: finalPadding,
          right: finalPadding,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();
    } else {
      return pipeline.resize(size, size, { fit: "fill" }).toBuffer();
    }
  }

  async run(
    files: string[],
    options: ConverterOptions,
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
      throw new Error(`Too many files! Maximum is ${arrayID.length} photos.`);
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

            const [headBuf, gloowallBuf, backpackBuf] = await Promise.all([
              this.processImage(imageBuffer, this.#sizes.head, options, 0),
              this.processImage(imageBuffer, this.#sizes.gloowall, options, 0),
              this.processImage(
                imageBuffer,
                this.#sizes.backpack,
                options,
                options.leagueFlag ? 30 : 0,
              ),
            ]);

            await Promise.all([
              fs.writeFile(
                path.join(cwd, this.#folders.head, `${id}.png`),
                headBuf,
              ),
              fs.writeFile(
                path.join(cwd, this.#folders.gloowall, `${id}.png`),
                gloowallBuf,
              ),
              fs.writeFile(
                path.join(cwd, this.#folders.backpack, `${id}.png`),
                backpackBuf,
              ),
            ]);

            drawTableData.push({
              teamName: file.split(".").slice(0, -1).join("."),
              charName: (HeadPicsIDs as any)[id]?.characterName || "",
              logoPath: inputPath,
              headPicPath: path.join(cwd, this.#folders.gloowall, `${id}.png`),
            });

            successFiles.push(file);
          } catch (err) {
            logger.error(`Lỗi xử lý file ${file}: ${err}`);
            errorFiles.push(file);
          } finally {
            bar.increment();
          }
        }),
      );
    }

    bar.stop();
    logger.success(`Xử lý hoàn tất: ${successFiles.length} thành công.`);
    return { successFiles, errorFiles, drawTableData };
  }
}

export default new Converter();
