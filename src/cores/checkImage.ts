import fs from "node:fs/promises";
import path from "node:path";
import { imageSizeFromFile } from "image-size/fromFile";
import { ISizeCalculationResult } from "image-size/types/interface";

type ImageInfo = ISizeCalculationResult & {
  name: string;
};

export const getValidImages = async (
  directory: string,
): Promise<Array<ImageInfo>> => {
  try {
    const files = await fs.readdir(directory);

    const checkPromises = files.map(async (file) => {
      const fullPath = path.join(directory, file);

      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile()) {
          const dimensions = await imageSizeFromFile(fullPath);

          if (dimensions && dimensions.type) {
            return { name: file, ...dimensions };
          }
        }
      } catch (err) {
        return null;
      }
      return null;
    });

    const results = await Promise.all(checkPromises);

    return results.filter((file) => file !== null);
  } catch (error) {
    throw new Error(`Không thể đọc thư mục: ${directory}`);
  }
};
