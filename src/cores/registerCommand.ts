import { Command } from "commander";
import registerCreateCommand from "../commands/create";
import registerSetCommand from "../commands/set";

export default function registerCommand(program: Command) {
  registerCreateCommand(program);
  registerSetCommand(program);
}
