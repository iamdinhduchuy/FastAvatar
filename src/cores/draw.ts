import sharp from "sharp";
import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

export type TeamData = {
  teamName: string;
  charName: string;
  logoPath: string;
  headPicPath: string;
}[];

const rootDir = process.cwd();
const FONT_FAMILY = "GFF_LATIN_BOLD";

const setupFont = () => {
  const fontPaths = [
    path.join(__dirname, "..", "assets", "fonts", "GFF_LATIN_BOLD.ttf"),
    path.join(rootDir, "assets", "fonts", "GFF_LATIN_BOLD.ttf"),
    path.join(rootDir, "dist", "assets", "fonts", "GFF_LATIN_BOLD.ttf"),
  ];

  const validPath = fontPaths.find((p) => fs.existsSync(p));

  if (validPath) {
    return fs.readFileSync(validPath);
  } else {
    logger.error(
      "❌ Không tìm thấy font GFF_LATIN_BOLD.ttf ở bất kỳ đường dẫn nào.",
    );
    return null;
  }
};

const embeddedFontBuffer = setupFont();

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
}

function buildSvgLayout(data: TeamData, totalHeight: number) {
  const CANVAS_WIDTH = 2560;
  const HEADER_BLACK_BAR_HEIGHT = 150;
  const HEADER_HEIGHT = 150;
  const ROW_HEIGHT = 150;
  const colWidths = { col1: 200, col2: 1000, col3: 200, col4: 1100 };
  const startX =
    (CANVAS_WIDTH -
      (colWidths.col1 + colWidths.col2 + colWidths.col3 + colWidths.col4)) /
    2;
  const xPos = {
    logo: startX,
    team: startX + colWidths.col1,
    head: startX + colWidths.col1 + colWidths.col2,
    char: startX + colWidths.col1 + colWidths.col2 + colWidths.col3,
  };

  const fontFace = embeddedFontBuffer
    ? `
      @font-face {
        font-family: '${FONT_FAMILY}';
        src: url('data:font/ttf;base64,${embeddedFontBuffer.toString("base64")}') format('truetype');
      }
    `
    : "";

  const rows = data
    .map((item, index) => {
      const rY = HEADER_BLACK_BAR_HEIGHT + HEADER_HEIGHT + index * ROW_HEIGHT;

      return `
        <g>
          <rect x="${xPos.logo}" y="${rY}" width="${colWidths.col1}" height="${ROW_HEIGHT}" fill="white" stroke="black" stroke-width="2" />
          <rect x="${xPos.team}" y="${rY}" width="${colWidths.col2}" height="${ROW_HEIGHT}" fill="white" stroke="black" stroke-width="2" />
          <rect x="${xPos.head}" y="${rY}" width="${colWidths.col3}" height="${ROW_HEIGHT}" fill="white" stroke="black" stroke-width="2" />
          <rect x="${xPos.char}" y="${rY}" width="${colWidths.col4}" height="${ROW_HEIGHT}" fill="white" stroke="black" stroke-width="2" />
          <text x="${xPos.team + 30}" y="${rY + ROW_HEIGHT / 2}" font-family="${FONT_FAMILY}, Arial, sans-serif" font-size="50" fill="black" text-anchor="start" dominant-baseline="middle">${escapeXml(truncateText(item.teamName, 20))}</text>
          <text x="${xPos.char + 30}" y="${rY + ROW_HEIGHT / 2}" font-family="${FONT_FAMILY}, Arial, sans-serif" font-size="50" fill="black" text-anchor="start" dominant-baseline="middle">${escapeXml(item.charName)}</text>
        </g>
      `;
    })
    .join("");

  return `
    <svg width="${CANVAS_WIDTH}" height="${totalHeight}" viewBox="0 0 ${CANVAS_WIDTH} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <style>
        ${fontFace}
        .header-label {
          font-family: '${FONT_FAMILY}, Arial, sans-serif';
          font-size: 60px;
          font-weight: 700;
          fill: #000000;
        }
      </style>
      <rect x="0" y="0" width="${CANVAS_WIDTH}" height="${totalHeight}" fill="#ffffff" />
      <rect x="0" y="0" width="${CANVAS_WIDTH}" height="${HEADER_BLACK_BAR_HEIGHT}" fill="#000000" />
      <rect x="${xPos.logo}" y="${HEADER_BLACK_BAR_HEIGHT}" width="${colWidths.col1 + colWidths.col2}" height="${HEADER_HEIGHT}" fill="none" stroke="black" stroke-width="2" />
      <text class="header-label" x="${xPos.logo + (colWidths.col1 + colWidths.col2) / 2}" y="${HEADER_BLACK_BAR_HEIGHT + HEADER_HEIGHT / 2}" text-anchor="middle" dominant-baseline="middle">Tên đầy đủ</text>
      <rect x="${xPos.head}" y="${HEADER_BLACK_BAR_HEIGHT}" width="${colWidths.col3 + colWidths.col4}" height="${HEADER_HEIGHT}" fill="none" stroke="black" stroke-width="2" />
      <text class="header-label" x="${xPos.head + (colWidths.col3 + colWidths.col4) / 2}" y="${HEADER_BLACK_BAR_HEIGHT + HEADER_HEIGHT / 2}" text-anchor="middle" dominant-baseline="middle">Avatar</text>
      ${rows}
    </svg>
  `;
}

export async function createTeamTableImage(data: TeamData, outputPath: string) {
  const CANVAS_WIDTH = 2560;
  const HEADER_BLACK_BAR_HEIGHT = 150;
  const HEADER_HEIGHT = 150;
  const ROW_HEIGHT = 150;

  const totalHeight =
    HEADER_BLACK_BAR_HEIGHT + HEADER_HEIGHT + data.length * ROW_HEIGHT;
  const baseImage = sharp({
    create: {
      width: CANVAS_WIDTH,
      height: totalHeight,
      channels: 4,
      background: "white",
    },
  });

  const colWidths = { col1: 200, col2: 1000, col3: 200, col4: 1100 };
  const startX =
    (CANVAS_WIDTH -
      (colWidths.col1 + colWidths.col2 + colWidths.col3 + colWidths.col4)) /
    2;
  const xPos = {
    logo: startX,
    team: startX + colWidths.col1,
    head: startX + colWidths.col1 + colWidths.col2,
    char: startX + colWidths.col1 + colWidths.col2 + colWidths.col3,
  };

  const overlays: sharp.OverlayOptions[] = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const rY = HEADER_BLACK_BAR_HEIGHT + HEADER_HEIGHT + i * ROW_HEIGHT;

    try {
      const [logoBuffer, headBuffer] = await Promise.all([
        sharp(item.logoPath).resize(180, ROW_HEIGHT - 20, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        }).toBuffer(),
        sharp(item.headPicPath).resize(180, ROW_HEIGHT - 20, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        }).toBuffer(),
      ]);

      overlays.push(
        { input: logoBuffer, left: xPos.logo + 10, top: rY + 10 },
        { input: headBuffer, left: xPos.head + 10, top: rY + 10 },
      );
    } catch {
      overlays.push(
        {
          input: Buffer.from(
            `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="130"><text x="0" y="65" font-family="Arial, sans-serif" font-size="24" fill="black">Error Load</text></svg>`,
          ),
          left: xPos.logo + 10,
          top: rY + 10,
        },
      );
    }
  }

  const svgBuffer = Buffer.from(buildSvgLayout(data, totalHeight));

  await baseImage
    .composite([
      { input: svgBuffer },
      ...overlays,
    ])
    .png()
    .toFile(outputPath);
}
