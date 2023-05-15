import * as fs from "fs";
import * as path from "path";
import {
    CancellationToken,
    Uri,
    Webview,
    WebviewView,
    WebviewViewProvider,
    WebviewViewResolveContext,
    window,
} from "vscode";
import getUri from "../utils/getUri";
import Microphone from "../utils/microphone";
import { convertAudio, fixAudio, transcribeAudio } from "../utils/audio";
import insertCode from "../utils/insertCode";
import { wait } from "../utils/pauseExecution";
import axios from "axios";

export default class CodeverbSidebar implements WebviewViewProvider {
    constructor(private readonly _extensionUri: Uri) {}

    public resolveWebviewView(
        webviewView: WebviewView,
        context: WebviewViewResolveContext,
        _token: CancellationToken
    ) {
        // Allow scripts in the webview
        webviewView.webview.options = {
            enableScripts: true
        };

        // Set the HTML content that will fill the webview view
        webviewView.webview.html = this._getWebviewContent(
            webviewView.webview,
            this._extensionUri
        );

        // Sets up an event listener to listen for messages passed from the webview view context
        // and executes code based on the message that is recieved
        this._setWebviewMessageListener(webviewView);
    }

    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        const toolkitUri = getUri(webview, extensionUri, [
            "node_modules",
            "@vscode",
            "webview-ui-toolkit",
            "dist",
            "toolkit.js",
        ]);
        const mainUri = getUri(webview, extensionUri, [
            "webview",
            "main.js",
        ]);
        const stylesUri = getUri(webview, extensionUri, [
            "webview",
            "styles.css",
        ]);
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script type="module" src="${toolkitUri}"></script>
                <script type="module" src="${mainUri}"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/agate.min.css">
                <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js"></script>
                <script>
                    hljs.highlightAll();                   
                </script>
                <link rel="stylesheet" href="${stylesUri}" />
                <title></title>
            </head>
            <body>
                <vscode-panels aria-label="Default">
                    <vscode-panel-tab id="tab-1">Algo To Code</vscode-panel-tab>
                    <vscode-panel-tab id="tab-2">Speech To Code</vscode-panel-tab>
                    <vscode-panel-view id="view-1">
                        <table>
                            <tr>
                                <th class="title">Algorithm</th>
                            </tr>
                        </table>
                        <br/>
                        <section>
                            <textarea cols="50" rows="10" id="algoInput"></textarea>
                        </section>
                        <table border="0" style="vertical-align: middle">
                            <tr>
                                <td>
                                    <vscode-button class="actionButton convertBtn" id="convertButton1">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22"><g stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M13.6 11.58v2.73c0 2.28-.91 3.19-3.19 3.19H7.69c-2.27 0-3.19-.91-3.19-3.19v-2.73c0-2.27.91-3.18 3.19-3.18h2.73c2.27 0 3.18.91 3.18 3.18Z"/><path d="M17.5 7.68v2.73c0 2.28-.91 3.19-3.19 3.19h-.71v-2.02c0-2.27-.91-3.18-3.19-3.18H8.4v-.72c0-2.28.91-3.18 3.19-3.18h2.73c2.27 0 3.18.91 3.18 3.18ZM21 14c0 3.87-3.13 7-7 7l1.05-1.75M1 8c0-3.87 3.13-7 7-7L6.95 2.75"/></g></svg>
                                        </span>
                                        <span>&nbsp;&nbsp;Convert</span>
                                    </vscode-button>
                                </td>
                            </tr>
                        </table>
                    </vscode-panel-view>
                    <vscode-panel-view id="view-2">
                        <table>
                            <tr>
                                <th class="title">Recording</th>
                            </tr>
                        </table>
                        <table>
                            <tr>
                                <td>
                                    <vscode-button class="actionButton recBtn recBtn1" id="startRecordBtn">Start</vscode-button>
                                </td>
                                <td>
                                    <vscode-button class="actionButton recBtn recBtn2"id="stopRecordBtn" disabled>Stop</vscode-button>
                                </td>
                            </tr>
                        </table>                       
                        <br/>
                        <table>
                            <tr>
                                <th class="title">Transciption</th>
                            </tr>
                        </table>
                        <br/>
                        <section id="sttOutput"><span style="color: grey;"><i>Your transcription will appear here</i></span></section>
                        <table border="0" style="vertical-align: middle">
                            <tr>
                                <td>
                                    <vscode-button class="actionButton convertBtn" id="convertButton2">
                                        <span>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22"><g stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M13.6 11.58v2.73c0 2.28-.91 3.19-3.19 3.19H7.69c-2.27 0-3.19-.91-3.19-3.19v-2.73c0-2.27.91-3.18 3.19-3.18h2.73c2.27 0 3.18.91 3.18 3.18Z"/><path d="M17.5 7.68v2.73c0 2.28-.91 3.19-3.19 3.19h-.71v-2.02c0-2.27-.91-3.18-3.19-3.18H8.4v-.72c0-2.28.91-3.18 3.19-3.18h2.73c2.27 0 3.18.91 3.18 3.18ZM21 14c0 3.87-3.13 7-7 7l1.05-1.75M1 8c0-3.87 3.13-7 7-7L6.95 2.75"/></g></svg>
                                        </span>
                                        <span>&nbsp;&nbsp;Convert</span>
                                    </vscode-button>
                                </td>
                            </tr>
                        </table>
                    </vscode-panel-view>
                </vscode-panels>
                <br/>
                <table>
                    <tr>
                        <th class="title">Python Code</th>
                        <th>
                            <vscode-button class="actionButton insertBtn" id="insertButton">
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#FFF" viewBox="0 0 48 48"><g data-name="Layer 2"><path fill="none" d="M0 0h48v48H0z" data-name="invisible box"/><g data-name="icons Q2"><path d="M8 9.7a2 2 0 0 1 .6-1.4A21.6 21.6 0 0 1 24 2a22 22 0 0 1 0 44 21.6 21.6 0 0 1-15.4-6.3 2 2 0 1 1 2.8-2.8 18 18 0 1 0 0-25.8 1.9 1.9 0 0 1-2.8 0A2 2 0 0 1 8 9.7Z"/><path d="m33.4 22.6-7.9-8a2.1 2.1 0 0 0-2.7-.2 1.9 1.9 0 0 0-.2 3l4.6 4.6H4a2 2 0 0 0-2 2 2 2 0 0 0 2 2h23.2l-4.6 4.6a1.9 1.9 0 0 0 .2 3 2.1 2.1 0 0 0 2.7-.2l7.9-8a1.9 1.9 0 0 0 0-2.8Z"/></g></g></svg>
                                </span>
                                <span>&nbsp;&nbsp;Insert</span>
                            </vscode-button>
                        </th>
                    </tr>
                </table>
                <section class="outputSection">
                    <pre>
                        <code class="language-python" id='pythonCode'># Converted Python code will appear here</code>
                    </pre>
                </section>
                <script>
                    function highlight(){
                        hljs.highlightElement(document.getElementById("pythonCode"));
                    }
                </script>
            </body>
        </html>
        `;
    }

    private _setWebviewMessageListener(webviewView: WebviewView) {
        let commandid = "";
        const recordingPath = path.join(__dirname, "..", "assets", "temp.wav");
        const finalRecording = path.join(__dirname, "..", "assets", "final.wav");
        const mic = new Microphone();
        let micStream = null;
        webviewView.webview.onDidReceiveMessage(async (message) => {
            const command = message.command;
            switch (command) {
                case "code.convert":
                    // Send a message to the webview to start processing
                    webviewView.webview.postMessage({
                        command: "code.convert.processing",
                    });
                    // Get the predicted code against our algorithm/text from our AI modal
                    const query = message.input;
                    const type = message.type;
                    let result;
                    let status = "success";
                    try {
                        result = "a=5\nb=10\ndef sum(a,b):\n\treturn a+b\nprint(sum(1,2))";
                        // result = await axios.post(`http://127.0.0.1:5050}/api/predict`, 
                        // { 
                        //     inference_type: type,
                        //     query: algorithm,
                        //     model: "CodeVerbTLM-0.7B"
                        // })
                        // .then(res => {
                        //     return res.data.result;
                        // })
                        // .catch(error => {
                        //     console.log(error);
                        //     return error;
                        // });
                        // Pause execution for 3 seconds to simulate the AI model processing
                        // Remove this line if you are using your own AI model
                        // await wait(3000);
                    } catch (err) {
                        result = err;
                        status = "error";
                    }
                    // Send the predicted code back to the webview
                    webviewView.webview.postMessage({
                        command: "code.convert."+status,
                        payload: result,
                    });
                    break;
                case "code.insert":
                    const editor = window.activeTextEditor;
                    if (!editor) {
                        window.showErrorMessage('No active editor found!');
                        break;
                    }
                    const currentLine = editor.selection.active.line;
                    await insertCode(editor, currentLine, message.result);
                    break;
                case "code.convert.error.algoEmpty":
                    window.showInformationMessage(
                        "Algorithm can't be empty! Provide a valid algorithm to convert."
                    );
                    break;
                case "code.convert.error.transcriptionEmpty":
                    window.showInformationMessage(
                        "Transcription can't be empty! Provide a valid voice command to convert."
                    );
                    break;
                case "code.startRecording":
                    let outputFileStream = fs.createWriteStream(recordingPath);
                    micStream = mic.startRecording();
                    micStream?.pipe(outputFileStream);
                    console.log("Recording started ...");
                    webviewView.webview.postMessage({
                        command: "code.transcription.status",
                        payload: "Recording voice input ...",
                    });
                    break;
                case "code.stopRecording":
                    mic.stopRecording();
                    console.log("Recording stopped ...");
                    webviewView.webview.postMessage({
                        command: "code.transcription.status",
                        payload: "Processing voice input ...",
                    });
                    // Adjusting the Audio Format and fixing the bugs
                    try {
                        await fixAudio(recordingPath);
                        await convertAudio(finalRecording);
                    }
                    catch(error) {
                        console.log(error);
                    }
                    // Converting Speech to text
                    try {
                        const transcription = await transcribeAudio(finalRecording);
                        webviewView.webview.postMessage({
                            command: "code.transcription.success",
                            payload: transcription,
                        });
                    }
                    catch (error) {
                        console.log("Transciption Error: ", error);
                        webviewView.webview.postMessage({
                            command: "code.transcription.error",
                            payload: error,
                        });
                    }
                    break;
            }
        });
    }
}