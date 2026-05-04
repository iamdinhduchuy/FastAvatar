export {};

import { Command } from "commander";

declare global {
  type IRegisterCommandFunction = (program: Command) => any;
}
