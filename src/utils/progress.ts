import * as cliProgress from "cli-progress";
import chalk from "chalk";

export const createProgressBar = () => {
  return new cliProgress.SingleBar({
    // Format: [Thanh bar] | Phần trăm | Số hiện tại/Tổng số
    format: `${chalk.cyan("Processing")} |${chalk.cyan("{bar}")}| {percentage}% | {value}/{total} Items`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
    fps: 30,
  });
};
