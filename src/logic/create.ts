interface CreateOptions {
  output?: string;
  league?: boolean;
}

export default function CreateLogicCommand(options: CreateOptions) {
  const { output, league } = options;
  console.log("Creating avatar configuration...");
  console.log(`Output: ${output || "default path"}`);
  console.log(`League format: ${league ? "Yes" : "No"}`);
}
