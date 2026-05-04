import chalk from "chalk";
import gradient from "gradient-string";
import figlet from "figlet";
import FastAvatar from "../fastavatar.json";

export const displayBanner = () => {
  const title = FastAvatar.displayName || "FastAvatar";
  const description = FastAvatar.description;

  const asciiArt = figlet.textSync(title, {
    font: "Slant",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true,
  });

  // Định nghĩa dải màu (Purple -> Blue)
  const claudeGradient = gradient(["#7b2ff7", "#2bd9fe", "#25a1ff"]);

  console.log("\n");
  console.log(claudeGradient.multiline(asciiArt));

  console.log(chalk.italic.hex("#a1a1a1")(`  ${description}`));

  console.log(
    chalk.cyan(`  v${FastAvatar.version} `) +
      chalk.gray("•") +
      chalk.green(" Ready to use!\n"),
  );

  console.log(chalk.gray("─".repeat(50)));
};
