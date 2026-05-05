import SetLogicCommand from "../logic/set";

const registerSetCommand: IRegisterCommandFunction = (program) => {
  program
    .command("set")
    .description("Set environment variables for FastAvatar")
    .option("-p --path <path>", "Default path to generate folder like HeadPics, GloowallPics, BackPackPics, etc. The image of list will be generated in current working directory")
    .action((options) => SetLogicCommand({ ...options }));
};

export default registerSetCommand;
