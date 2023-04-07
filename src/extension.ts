import * as vscode from 'vscode';
import { manageStatus, manageStatusTheme } from "./utils/manageStatus";
import { enableExtension } from './utils/config';

// Global variables
let isCodeLoading = false;
let originalColor: string | vscode.ThemeColor | undefined;
let statusBar: vscode.StatusBarItem;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Define our editor
	let editor: vscode.TextEditor;

	// Initialize our status bar item
    statusBar = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
	manageStatusTheme(statusBar, originalColor);
    manageStatus(statusBar, isCodeLoading, false, "No Suggestions");

	console.log('Congratulations, your extension "CodeVerb" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('codeverbs.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from codeverbs!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
