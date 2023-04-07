import * as vscode from "vscode";
import { enableExtension } from './config';

var statusbartimer: NodeJS.Timeout;

let isExtEnabled = enableExtension;

export async function manageStatus(
    statusBar: vscode.StatusBarItem,
    codeIsLoading: boolean,
    isLoading: boolean,
    info: string,
): Promise<void> {
    statusBar.tooltip = `${(isExtEnabled)? "Disable" : "Enable"} CodeVerb`;
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

export function manageStatusTheme(
    statusBar: vscode.StatusBarItem,
    originalColor: string | vscode.ThemeColor | undefined,
    isEnabled: boolean
): void {
    statusBar.show();
    if (isEnabled) {
        isExtEnabled = true;
        statusBar.backgroundColor = originalColor;
    }
    else {
        isExtEnabled = false;
        originalColor = statusBar.backgroundColor;
        statusBar.backgroundColor = new vscode.ThemeColor(
            "statusBarItem.warningBackground"
        );
    }
    manageStatus(statusBar, false, false, "");
}