import * as vscode from 'vscode';

export default async function insertCode(
    editor: vscode.TextEditor,
    commentLine: number,
    code: string
) {
    const lineCount = editor.document.lineCount;
    const linesAfterComment = lineCount - (commentLine + 1);
    const currentLine = editor.document.lineAt(commentLine);
    const currentIndentation = currentLine.text.match(/^\s*/)?.[0] ?? "";
    const insertNewLine = linesAfterComment === 0 ? "\n" : "";
    const insertPosition = new vscode.Position(commentLine + 1, 0);
    const insertText = insertNewLine + currentIndentation + code.split('\n').join('\n' + currentIndentation) + '\n';
    await editor.edit(editBuilder => {
        editBuilder.insert(insertPosition, insertText);
    });
}