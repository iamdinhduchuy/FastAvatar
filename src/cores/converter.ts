import sharp from "sharp";
import HeadPicsIDs from "../constants/headpics.json";
import { createProgressBar } from "../utils/progress";
import { logger } from "../utils/logger";
import fs from "node:fs/promises";
import fsSync from "fs";
import path from "path";
import { TeamData } from "./draw";
import { CHARACTERS_IMAGES_PATH } from "../constants/path";

export interface ConverterOptions {
  leagueFlag?: boolean;
  padding?: number;
}

type AlphaBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type RawBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

class Converter {
  #folders = {
    head: "HeadPics",
    gloowall: "GloowallPics",
    backpack: "BackPackPics",
  };

  #sizes = { head: 110, gloowall: 1000, backpack: 1000 };

  private pickTightestBounds(boundsList: Array<RawBounds | null>) {
    const validBounds = boundsList.filter(Boolean) as RawBounds[];

    if (validBounds.length === 0) {
      return null;
    }

    return validBounds.reduce((tightest, current) => {
      const tightestArea = tightest.width * tightest.height;
      const currentArea = current.width * current.height;

      return currentArea < tightestArea ? current : tightest;
    });
  }

  private async getContentBounds(
    inputBuffer: Buffer,
  ): Promise<RawBounds | null> {
    const metadata = await sharp(inputBuffer).metadata();

    if (metadata.width === undefined || metadata.height === undefined) {
      return null;
    }

    const width = metadata.width;
    const height = metadata.height;

    const scanAlphaBounds = async (): Promise<RawBounds | null> => {
      const { data, info } = await sharp(inputBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const alphaThreshold = 10;
      const channels = info.channels;

      let left = width;
      let top = height;
      let right = -1;
      let bottom = -1;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const alphaIndex = (y * width + x) * channels + 3;
          if (data[alphaIndex] > alphaThreshold) {
            if (x < left) left = x;
            if (y < top) top = y;
            if (x > right) right = x;
            if (y > bottom) bottom = y;
          }
        }
      }

      if (right === -1 || bottom === -1) {
        return null;
      }

      return {
        left,
        top,
        width: right - left + 1,
        height: bottom - top + 1,
      };
    };

    const scanBackgroundBounds = async (): Promise<RawBounds | null> => {
      const { data, info } = await sharp(inputBuffer).raw().toBuffer({
        resolveWithObject: true,
      });

      const channels = info.channels;
      const background = [data[0], data[1], data[2]];
      const differenceThreshold = 18;
      const thresholdSquared = differenceThreshold * differenceThreshold;

      let left = width;
      let top = height;
      let right = -1;
      let bottom = -1;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * channels;
          const red = data[pixelIndex];
          const green = data[pixelIndex + 1];
          const blue = data[pixelIndex + 2];

          const diffSquared =
            (red - background[0]) * (red - background[0]) +
            (green - background[1]) * (green - background[1]) +
            (blue - background[2]) * (blue - background[2]);

          if (diffSquared > thresholdSquared) {
            if (x < left) left = x;
            if (y < top) top = y;
            if (x > right) right = x;
            if (y > bottom) bottom = y;
          }
        }
      }

      if (right === -1 || bottom === -1) {
        return null;
      }

      return {
        left,
        top,
        width: right - left + 1,
        height: bottom - top + 1,
      };
    };

    const scanLuminanceBounds = async (): Promise<RawBounds | null> => {
      const { data, info } = await sharp(inputBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const channels = info.channels;
      const luminanceThreshold = 28;

      let left = width;
      let top = height;
      let right = -1;
      let bottom = -1;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = (y * width + x) * channels;
          const red = data[pixelIndex];
          const green = data[pixelIndex + 1];
          const blue = data[pixelIndex + 2];
          const alpha = data[pixelIndex + 3];

          const luminance =
            0.2126 * red + 0.7152 * green + 0.0722 * blue;

          if (alpha > 10 || luminance > luminanceThreshold) {
            if (x < left) left = x;
            if (y < top) top = y;
            if (x > right) right = x;
            if (y > bottom) bottom = y;
          }
        }
      }

      if (right === -1 || bottom === -1) {
        return null;
      }

      return {
        left,
        top,
        width: right - left + 1,
        height: bottom - top + 1,
      };
    };


    if (metadata.hasAlpha) {
      const alphaBounds = await scanAlphaBounds();

      if (
        alphaBounds &&
        alphaBounds.width * alphaBounds.height < width * height * 0.98
      ) {
        return alphaBounds;
      }
    }

    return this.pickTightestBounds([
      await scanBackgroundBounds(),
      await scanLuminanceBounds(),
    ]);
  }

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
      const contentBounds = await this.getContentBounds(inputBuffer);
      let contentPipeline = sharp(inputBuffer).ensureAlpha();

      if (contentBounds) {
        contentPipeline = contentPipeline.extract(contentBounds);
      }

      return contentPipeline
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
              headPicPath: path.join(CHARACTERS_IMAGES_PATH, `${id}.png`),
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
