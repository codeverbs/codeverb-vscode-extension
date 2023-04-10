# CodeVerb

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/yourmarketplace.id.svg?label=Visual%20Studio%20Marketplace&logo=visual-studio-code&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=yourmarketplace.id)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/codeverbs/codeverb-vscode-extension?logo=github)](https://github.com/codeverbs/codeverb-vscode-extension/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/codeverbs/codeverb-vscode-extension/blob/main/LICENSE)

CodeVerb is a Visual Studio Code extension that links to our AI modal which converts text to Python code. It's developed using TypeScript.

## Features

CodeVerb has the following main features:

- **Algorithm to Code**: This mode takes algorithm or long text inputs through a webview sidebar and displays converted code. The user then has the ability to insert that code into the editor using the insert button.
- **Command Mode**: In this mode, the user first types a single-line Python comment and presses Shift + C keys to insert generated code based on the comment on the next line.
- **Stealth Mode**: In this mode, the extension provides inline code completions automatically while the user is writing code.

## Installation

You can install the extension by searching for "CodeVerb" in the Visual Studio Code extensions marketplace or by running the following command in the command palette:
```
ext install yourmarketplace.id
```


## Usage

### Algorithm to Code

To use the "Algorithm to Code" mode, follow these steps:

1. Open the Command Palette (Ctrl + Shift + P on Windows, Cmd + Shift + P on macOS).
2. Search for "CodeVerb: Algorithm to Code".
3. Or you can click on the CodeVerb icon located on right pane to open "Algorithm to Code" mode.
3. Enter your algorithm or long text in the input box in the sidebar.
4. Click on the "Convert" button to convert the text to Python code.
5. Click on the "Insert" button to insert the generated code into the active editor.

### Command Mode

To use the "Command Mode", follow these steps:

1. Type a single-line Python comment in the active editor.
2. Press Shift + C keys to insert generated code based on the comment on the next line.

### Stealth Mode

To use the "Stealth Mode", simply start typing code in the active editor, and the extension will provide inline code completions automatically.

## License

CodeVerb is licensed under the [MIT License](https://github.com/codeverbs/codeverb-vscode-extension/blob/main/LICENSE).
