import * as vscode from "vscode";
import { enableExtension } from "./config";
import { manageStatusTheme } from "./manageStatus";

let extToggle = enableExtension;
export default async function toggleExt(
    statusBar: vscode.StatusBarItem,
    originalColor: string | vscode.ThemeColor | undefined,
    context: vscode.ExtensionContext
) {
    if (extToggle) {
        const answer = await vscode.window.showInformationMessage(
            "Disable CodeVerb for this workspace?",
            "Disable",
        );
        if (answer === "Disable") {
            extToggle = false;
            const configuration = vscode.workspace.getConfiguration("codeverbs", undefined);
            configuration.update("EnableExtension", false);
            await context.globalState.update("EnableExtension", false);
            manageStatusTheme(statusBar, originalColor, false);
        }
    } else {
        const answer = await vscode.window.showInformationMessage(
            "Enable CodeVerb for this workspace?",
            "Enable"
        );
        if (answer === "Enable") {
            extToggle = true;
            const configuration = vscode.workspace.getConfiguration("codeverbs", undefined);
            configuration.update("EnableExtension", true);
            await context.globalState.update("EnableExtension", true);
            manageStatusTheme(statusBar, originalColor, true);
        }
    }
}