
import { workspace } from "vscode";

// Load our configuration
const configuration = workspace.getConfiguration("codeverbs", undefined);

// Get the configuration values
// export const enableExtension = configuration.get("EnableExtension", true);
export const enableExtension = false;

export const controls = {
    promptMode: {
        mac: "Option + T",
        win: "Ctrl + T",
    },
    nextSuggestion: {
        mac: "Shift + >",
        win: "Shift + >",
    },
    previousSuggestion: {
        mac: "Shift + <",
        win: "Shift + <",
    },
    newSuggestion: {
        mac: "Shift + N",
        win: "Shift + N",
    },
};