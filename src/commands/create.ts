import CreateLogicCommand from "../logic/create";

const registerCreateCommand: IRegisterCommandFunction = (program) => {
  program
    .command("create")
    .description("Create a new avatar configuration file")
    .option(
      "-o",
      "--output <path>",
      "Specify the output path for the avatar configuration file",
    )
    .option(
      "-l",
      "--league",
      "Use to want the format of the avatar is a eSports League",
    )
    .action((options) => CreateLogicCommand({ ...options }));
};

export default registerCreateCommand;
