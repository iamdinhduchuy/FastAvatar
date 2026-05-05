import { loadImage, createCanvas, registerFont } from "canvas";
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

const setupFont = () => {
  const fontPaths = [
    path.join(__dirname, "..", "assets", "fonts", "GFF_LATIN_BOLD.ttf"),
    path.join(rootDir, "assets", "fonts", "GFF_LATIN_BOLD.ttf"),
    path.join(rootDir, "dist", "assets", "fonts", "GFF_LATIN_BOLD.ttf"),
  ];

  const validPath = fontPaths.find((p) => fs.existsSync(p));

  if (validPath) {
    registerFont(validPath, { family: "GFF_LATIN_BOLD" });
    // console.log(`✅ Đã nạp font từ: ${validPath}`);
  } else {
    logger.error(
      "❌ Không tìm thấy font GFF_LATIN_BOLD.ttf ở bất kỳ đường dẫn nào.",
    );
  }
};

setupFont();

function drawImageScaled(
  ctx: any,
  img: any,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  const newWidth = img.width * ratio;
  const newHeight = img.height * ratio;

  // Căn giữa ảnh trong ô
  const offsetX = (maxWidth - newWidth) / 2;
  const offsetY = (maxHeight - newHeight) / 2;

  ctx.drawImage(img, x + offsetX, y + offsetY, newWidth, newHeight);
}

export async function createTeamTableImage(data: TeamData, outputPath: string) {
  const CANVAS_WIDTH = 2560;
  const HEADER_BLACK_BAR_HEIGHT = 150;
  const HEADER_HEIGHT = 150;
  const ROW_HEIGHT = 150;
  const FONT_FAMILY = "GFF_LATIN_BOLD";

  const totalHeight =
    HEADER_BLACK_BAR_HEIGHT + HEADER_HEIGHT + data.length * ROW_HEIGHT;
  const canvas = createCanvas(CANVAS_WIDTH, totalHeight);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_WIDTH, totalHeight);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, CANVAS_WIDTH, HEADER_BLACK_BAR_HEIGHT);

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

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.font = `bold 60px ${FONT_FAMILY}`;
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const hY = HEADER_BLACK_BAR_HEIGHT;
  ctx.strokeRect(xPos.logo, hY, colWidths.col1 + colWidths.col2, HEADER_HEIGHT);
  ctx.fillText(
    "Tên đầy đủ",
    xPos.logo + (colWidths.col1 + colWidths.col2) / 2,
    hY + HEADER_HEIGHT / 2,
  );
  ctx.strokeRect(xPos.head, hY, colWidths.col3 + colWidths.col4, HEADER_HEIGHT);
  ctx.fillText(
    "Avatar",
    xPos.head + (colWidths.col3 + colWidths.col4) / 2,
    hY + HEADER_HEIGHT / 2,
  );

  ctx.font = `50px ${FONT_FAMILY}`;
  ctx.textAlign = "left";

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const rY = hY + HEADER_HEIGHT + i * ROW_HEIGHT;

    ctx.strokeRect(xPos.logo, rY, colWidths.col1, ROW_HEIGHT);
    ctx.strokeRect(xPos.team, rY, colWidths.col2, ROW_HEIGHT);
    ctx.strokeRect(xPos.head, rY, colWidths.col3, ROW_HEIGHT);
    ctx.strokeRect(xPos.char, rY, colWidths.col4, ROW_HEIGHT);

    try {
      const [imgLogo, imgHead] = await Promise.all([
        loadImage(item.logoPath),
        loadImage(item.headPicPath),
      ]);

      // Kích thước ô trừ đi padding (ví dụ padding là 10px mỗi bên)
      const drawW = 180;
      const drawH = ROW_HEIGHT - 20; // 130px

      // Sử dụng hàm vẽ chống méo
      drawImageScaled(ctx, imgLogo, xPos.logo + 10, rY + 10, drawW, drawH);
      drawImageScaled(ctx, imgHead, xPos.head + 10, rY + 10, drawW, drawH);

      const tName =
        item.teamName.length > 20
          ? item.teamName.substring(0, 17) + "..."
          : item.teamName;
      ctx.fillStyle = "#000000";
      ctx.fillText(tName, xPos.team + 30, rY + ROW_HEIGHT / 2);
      ctx.fillText(item.charName, xPos.char + 30, rY + ROW_HEIGHT / 2);
    } catch (e) {
      ctx.fillText("Error Load", xPos.logo + 10, rY + ROW_HEIGHT / 2);
    }
  }

  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));
}
