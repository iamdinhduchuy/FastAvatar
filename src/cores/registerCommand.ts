import { Command } from "commander";
import registerCreateCommand from "../commands/create";

export default function registerCommand(program: Command) {
  // Dynamically import all command modules from the 'commands' directory
  registerCreateCommand(program);
}
