# ⚡ FastAvatar

> A fast CLI tool to convert team avatar images of any format into PNG — built for **PC Client** software used in **eSports FreeFire tournament leagues**.

---

## 📖 What is FastAvatar?

FastAvatar is a Node.js command-line interface (CLI) tool designed for tournament organizers running **Garena Free Fire eSports leagues**. When setting up the PC Client software for a tournament, each participating team must have their logo/avatar registered in the correct folder structure and PNG format with specific sizes expected by the client.

FastAvatar automates the entire process:

1. **Scans** the current working directory for any valid image files (JPG, PNG, WEBP, etc.).
2. **Converts and resizes** each image into three versions required by the Free Fire PC Client:
   - **HeadPics** — 110×110 px (player avatar)
   - **GloowallPics** — 1000×1000 px (glow wall banner)
   - **BackPackPics** — 1000×1000 px (backpack skin)
3. **Names** each output file according to the internal `headPics` ID mapping used by the client.
4. **Generates** a `team_table.png` summary image — a 2560 px wide table showing each team's logo, full name, and assigned avatar character name — ready for use as a match reference sheet.

---

## 🛠️ How It Works

```
Working Directory
├── TeamA.png          ← input logo (any format)
├── TeamB.jpg          ← input logo (any format)
├── TeamC.webp         ← input logo (any format)
│
└── [after running fastavatar create]
    ├── HeadPics/
    │   ├── <id>.png   ← 110px avatar
    ├── GloowallPics/
    │   ├── <id>.png   ← 1000px glow wall
    ├── BackPackPics/
    │   ├── <id>.png   ← 1000px backpack
    └── team_table.png ← summary reference image
```

- Images are processed in parallel batches of 5 for maximum speed.
- Each image is mapped sequentially to a pre-defined Free Fire character ID (`headPics` ID list).
- Output folders are created automatically if they do not exist.

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** v18 or later — [Download here](https://nodejs.org/)
- **npm** (bundled with Node.js)

### Windows (Automated Setup)

A one-click setup script is provided for Windows users:

1. Clone or download this repository.
2. Double-click `Setup_Windows.bat` and run it as Administrator.

The script will automatically:
- Check for Node.js and install it (v22 LTS) if not found.
- Run `npm install` to install all dependencies.
- Run `npm link` to register the `fastavatar` command globally.
- Build the project with `npm run build`.

### Manual Setup (Windows / macOS / Linux)

```bash
# 1. Clone the repository
git clone https://github.com/iamdinhduchuy/FastAvatar.git
cd FastAvatar

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Link the CLI globally
npm link
```

After linking, the `fastavatar` command will be available in any terminal.

---

## 🚀 How to Use

### 1. Prepare your images

Place all team logo images in a single folder. Supported formats include PNG, JPG, JPEG, WEBP, GIF, and more.

```
my-tournament/
├── Team Alpha.png
├── Team Beta.jpg
├── Team Gamma.webp
```

> ⚠️ The number of images must not exceed the number of available character IDs in the mapping file.

### 2. Run the `create` command

Navigate to the folder containing your images and run:

```bash
cd my-tournament
fastavatar create
```

#### Options

| Option | Description |
|--------|-------------|
| `-l`, `--league` | Use the eSports League avatar format |
| `-o`, `--output <path>` | Specify a custom output path for the avatar configuration |

#### Example with league flag

```bash
fastavatar create --league
```

### 3. Output

After running, the following will be generated inside your working directory:

| Path | Description |
|------|-------------|
| `HeadPics/<id>.png` | 110px player avatar |
| `GloowallPics/<id>.png` | 1000px glow wall image |
| `BackPackPics/<id>.png` | 1000px backpack skin image |
| `team_table.png` | Summary reference table (2560px wide PNG) |

Copy the generated `HeadPics`, `GloowallPics`, and `BackPackPics` folders into the appropriate directory of the Free Fire PC Client software.

---

## 🖼️ team_table.png Preview

The generated `team_table.png` is a 2560 px wide reference sheet containing:

- Team logo thumbnail
- Full team name
- Assigned Free Fire character name

This is useful for tournament staff to quickly verify avatar assignments during match setup.

---

## 📋 Tech Stack

| Package | Purpose |
|---------|---------|
| [sharp](https://sharp.pixelplumbing.com/) | High-performance image conversion and resizing |
| [canvas](https://github.com/Automattic/node-canvas) | Drawing the team table summary image |
| [commander](https://github.com/tj/commander.js) | CLI argument parsing |
| [chalk](https://github.com/chalk/chalk) | Terminal color output |
| [cli-progress](https://github.com/npkgz/cli-progress) | Progress bar during batch processing |
| [figlet](https://github.com/patorjk/figlet.js) | ASCII art banner |
| [gradient-string](https://github.com/bokub/gradient-string) | Gradient color terminal text |
| [image-size](https://github.com/image-size/image-size) | Detecting valid image files |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) — © 2026 iamdinhduchuy.
