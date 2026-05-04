#!/usr/bin/env node
import { Command } from "commander";
import { displayBanner } from "./utils/banner";
import registerCommand from "./cores/registerCommand";

const program = new Command();

program
  .name("fastavatar")
  .description(
    "A CLI tool to automatically create avatars config for Free Fire (PC Client)",
  )
  .version("1.0.0")
  .action(() => displayBanner());

registerCommand(program);

program.parse(process.argv);
