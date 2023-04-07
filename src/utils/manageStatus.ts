import * as vscode from "vscode";
import { enableExtension } from './config';

var statusbartimer: NodeJS.Timeout;

export async function manageStatus(
    statusBar: vscode.StatusBarItem,
    codeIsLoading: boolean,
    isLoading: boolean,
    info: string,
): Promise<void> {
    statusBar.tooltip = `${(enableExtension)? "Disable" : "Enable"} CodeVerb`;
    statusBar.show();
    if (statusbartimer) {
        clearTimeout(statusbartimer);
    }
    if (isLoading) {
        codeIsLoading = true;
        statusBar.text = `$(loading~spin)` + " " + info;
    } else if(enableExtension) {
        codeIsLoading = false;
        statusBar.text = `$(codeverb-logo)` + " " + info;
        // Remove status text after 15 seconds
        statusbartimer = setTimeout(() => {
            statusBar.text = `$(codeverb-logo)`;
        }, 15000);
    }
    else {
        statusBar.text = `$(codeverb-logo)`;
    }
}

let isExtEnable: boolean;

export function manageStatusTheme(
    statusBar: vscode.StatusBarItem,
    originalColor: string | vscode.ThemeColor | undefined,
    switchTab?: boolean
): void {
    statusBar.show();
    manageStatus(statusBar, false, false, "");
    if (switchTab) {
        if (isExtEnable) {
            statusBar.backgroundColor = originalColor;
        } else {
            originalColor = statusBar.backgroundColor;
            statusBar.backgroundColor = new vscode.ThemeColor(
                "statusBarItem.warningBackground"
            );
        }
    } else {
        isExtEnable = enableExtension;
        if (enableExtension) {
            statusBar.backgroundColor = originalColor;
        } else {
            originalColor = statusBar.backgroundColor;
            statusBar.backgroundColor = new vscode.ThemeColor(
                "statusBarItem.warningBackground"
            );
        }
    }
}