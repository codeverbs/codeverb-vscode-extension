import * as vscode from 'vscode';
import { manageStatus } from '../utils/manageStatus';

export async function commandMode(
    statusBar: vscode.StatusBarItem,
    extContext: vscode.ExtensionContext
) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found!');
        return;
    }
    const enableExtension = await extContext.globalState.get("EnableExtension");
    if(!enableExtension) {
        vscode.window.showErrorMessage('Extension is disabled! Please enable your extension to use this feature.');
        return;
    }
    const currentLine = editor.selection.active.line;
    const currentLineText = editor.document.lineAt(currentLine).text;
    if (!currentLineText.startsWith('#')) {
        vscode.window.showErrorMessage('Current line is not a comment!');
        return;
    }
    const commentText = currentLineText.slice(1).trim();
    if (commentText.length < 6) {
        vscode.window.showErrorMessage('Comment is too short!');
        return;
    }
    manageStatus(statusBar, true, "");
    let result;
    let status = "Done";
    try {
        result = await getPredictedCode(commentText);
    }
    catch (error) {
        result = error;
        status = "Error";
    }
    console.log("Comment: " + commentText);
    console.log("Result: " + result);
    manageStatus(statusBar, false, status);
}

async function getPredictedCode(
    commentText: string
  ): Promise<string> {
    // Call your AI model here and return the predicted code
    return new Promise(resolve => {
      setTimeout(() => {
        resolve("def sum(a,b):\n\treturn a+b\nprint(sum(1,2))");
      }, 2000);
    });
}