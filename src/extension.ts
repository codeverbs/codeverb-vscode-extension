import * as vscode from 'vscode';
import { manageStatus, manageStatusTheme } from "./utils/manageStatus";
import { enableExtension } from './utils/config';
import toggleExt from './utils/toggleExtension';
import CodeverbSidebar from './features/Sidebar';
import { commandMode } from './features/CommandMode';

// Global variables
let originalColor: string | vscode.ThemeColor | undefined;
let statusBar: vscode.StatusBarItem;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Welcome Message
	console.log('Congratulations, your extension "CodeVerb" is now active!');

	// Define our editor
	let editor: vscode.TextEditor;

	// Initialize our status bar item
    statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
	manageStatusTheme(statusBar, originalColor, enableExtension);
    manageStatus(statusBar, false, "No Suggestions");

	// Enable/Disable extension
	const statusBarCommand = "codeverbs.toggle-extension";
    context.subscriptions.push(
        vscode.commands.registerCommand(statusBarCommand, () => {
            toggleExt(statusBar, originalColor, context);
        })
    );
	statusBar.command = statusBarCommand;
    context.subscriptions.push(statusBar);

	// Set extension status in global state
    if (enableExtension) {
        context.globalState.update("EnableExtension", true);
    } else {
        context.globalState.update("EnableExtension", false);
    }

    // Command mode convert comment to Python 
    context.subscriptions.push(
        vscode.commands.registerCommand("codeverbs.command-mode-convert", async () => {
            commandMode(statusBar, context);
        })
    );

    // Set the algo to code sidebars
    const sidebar = new CodeverbSidebar(
        context.extensionUri
    );
    const sidebarView = vscode.window.registerWebviewViewProvider(
        "codeverb-algo-to-code",
        sidebar
    );
    context.subscriptions.push(sidebarView);
}

// This method is called when your extension is deactivated
export function deactivate() {}
