// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Wait for DOM to load before running main
window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
    const convertBtn = document.getElementById("convertButton");
    convertBtn.addEventListener("click", () => {
        algoToPython();
    });
    const insertBtn = document.getElementById("insertButton");
    insertBtn.addEventListener("click", () => {
        insertCode();
    });
    webviewMessageListener();
}

// Sends a message to the extension context to convert the algorithm to python
function algoToPython() {
    const algoInput = document.getElementById("algoInput").value;
    if (algoInput.length > 0) {
        const convertBtn = document.getElementById("convertButton");
        convertBtn.disabled = true;
        vscode.postMessage({
            command: "code.convert",
            algoInput: algoInput,
        });
    } else {
        vscode.postMessage({
            command: "code.convert.error.inputEmpty",
        });
    }
}

// Sends a message to the extension context to insert the code into the active editor
function insertCode() {
    const codeDiv = document.getElementById("pythonCode");
    vscode.postMessage({
        command: "code.insert",
        result: codeDiv.innerText,
    });
}

// Listens for messages from the extension context and executes the appropriate function
function webviewMessageListener() {
    window.addEventListener("message", (event) => {
        const command = event.data.command;
        const convertBtn = document.getElementById("convertButton");
        switch (command) {
            case "code.convert.success":
                displayData(event.data.payload);
                convertBtn.disabled = false;
                break;
            case "code.convert.processing":
                displayData("# Processing...\n# This may take some time");
                break;
            case "code.convert.error":
                displayData("Error: " + event.data.payload);
                convertBtn.disabled = false;
                break;
        }
    });
}

// Displays the converted code in the webview
function displayData(data) {
    const codeDiv = document.getElementById("pythonCode");
    if (codeDiv.childNodes) {
        let len = codeDiv.childNodes.length;
        for (let i = 0; i < len; i++) {
            codeDiv.removeChild(codeDiv.childNodes[0]);
        }
    }
    codeDiv.append(data);
    highlight();
}