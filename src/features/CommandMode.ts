import * as vscode from 'vscode';
import { manageStatus } from '../utils/manageStatus';
import insertCode from '../utils/insertCode';
import axios from 'axios';

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
    const currentLineText = editor.document.lineAt(currentLine).text?.trim();
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
    let result: string;
    let status = "Done";
    try {
        result = await getPredictedCode(commentText);
        // Insert the result into the editor in the next line after the comment
        await insertCode(editor, currentLine, result);
    }
    catch (error) {
        result = "";
        status = "Error";
    }
    console.log("Comment: " + commentText);
    console.log("Result: " + result);
    manageStatus(statusBar, false, status);
}

async function getPredictedCode(commentText: string): Promise<string> {
    return new Promise((resolve, reject) => {
      axios.post(`http://127.0.0.1:5050/api/predict`, {
        inference_type: "Comment2Python",
        query: commentText,
        model: "CodeVerbTLM-0.1B"
      })
        .then(res => {
          resolve(res.data.result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

