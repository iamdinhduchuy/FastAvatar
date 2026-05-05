import chalk from "chalk";
import gradient from "gradient-string";

const primaryGradient = gradient(["#00F2FE", "#4FACFE"]);

export const logger = {
  error: (msg: string) => {
    console.log(chalk.bgRed.white.bold(" ERROR ") + " " + chalk.red(msg));
  },

  warn: (msg: string) => {
    console.log(chalk.bgYellow.white.bold(" WARN ") + " " + chalk.yellow(msg));
  },

  success: (msg: string) => {
    console.log(chalk.bgGreen.white.bold(" SUCCESS ") + " " + chalk.green(msg));
  },

  info: (msg: string) => {
    console.log(chalk.bgBlue.white.bold(" INFO ") + " " + chalk.blue(msg));
  },

  default: (msg: string) => {
    console.log(chalk.bgWhite.black.bold(" LOG ") + " " + chalk.white(msg));
  },

  important: (msg: string) => {
    console.log(primaryGradient.multiline(">> " + msg));
  },
};
