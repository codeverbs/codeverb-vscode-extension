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

export default class CodeverbSidebar implements WebviewViewProvider {
    constructor(private readonly _extensionUri: Uri) {}

    public resolveWebviewView(
        webviewView: WebviewView,
        context: WebviewViewResolveContext,
        _token: CancellationToken
    ) {
        // Allow scripts in the webview
        webviewView.webview.options = {
            enableScripts: true,
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
            "src/webview",
            "main.js",
        ]);
        const stylesUri = getUri(webview, extensionUri, [
            "src/webview",
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
                <title>Algorithm To Code</title>
            </head>
            <body>
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
                            <vscode-button class="actionButton convertBtn" id="convert-button">
                                <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 22 22"><g stroke="#FFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M13.6 11.58v2.73c0 2.28-.91 3.19-3.19 3.19H7.69c-2.27 0-3.19-.91-3.19-3.19v-2.73c0-2.27.91-3.18 3.19-3.18h2.73c2.27 0 3.18.91 3.18 3.18Z"/><path d="M17.5 7.68v2.73c0 2.28-.91 3.19-3.19 3.19h-.71v-2.02c0-2.27-.91-3.18-3.19-3.18H8.4v-.72c0-2.28.91-3.18 3.19-3.18h2.73c2.27 0 3.18.91 3.18 3.18ZM21 14c0 3.87-3.13 7-7 7l1.05-1.75M1 8c0-3.87 3.13-7 7-7L6.95 2.75"/></g></svg>
                                </span>
                                <span>&nbsp;&nbsp;Convert</span>
                            </vscode-button>
                        </td>
                    </tr>
                </table>
                <br/>
                <table>
                    <tr>
                        <th class="title">Python Code</th>
                        <th>
                            <vscode-button class="actionButton insertBtn" id="insert-button">
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
                        <code id='pythonCode'>Converted Python code will appear here</code>
                    </pre>
                    <script>
                        function highlight(){
                            hljs.highlightElement(document.getElementById("pythonCode"));
                        }
                    </script>
                </section>
            </body>
        </html>
        `;
    }

    private _setWebviewMessageListener(webviewView: WebviewView) {
        let commandid = "";
        webviewView.webview.onDidReceiveMessage(async (message) => {
            const command = message.command;

            // switch (command) {
            //     case "code.translate":
            //         const original = message.original;
            //         const srcLang = message.srcLang;
            //         const dstLang = message.dstLang;
            //         let result;
            //         try {
            //             result = await getCodeTranslation(
            //                 original,
            //                 srcLang,
            //                 dstLang
            //             );
            //             //await codegeexCodeTranslation(dstLang,result.translation[0],'')
            //         } catch (err) {
            //             console.log(err);
            //             result = {
            //                 translation: [],
            //             };
            //         }
            //         try {
            //             commandid = await getStartData(
            //                 original,
            //                 original,
            //                 `${srcLang}->${dstLang}`,
            //                 "translation"
            //             );
            //         } catch (err) {
            //             console.log(err);
            //             commandid = "";
            //         }
            //         webviewView.webview.postMessage({
            //             command: "code.translate",
            //             payload: result.translation[0],
            //             lang: getDocumentLangId(dstLang),
            //             commandid: commandid,
            //         });

            //         break;
            //     case "code.insert":
            //         const editor = window.activeTextEditor;
            //         if (!editor) {
            //             break;
            //         }
            //         editor.edit(async (editBuilder) => {
            //             var s = editor.selection;

            //             editBuilder.replace(s, message.result);
            //         });
            //         if (commandid.length > 0) {
            //             await getEndData(commandid, "", "Yes", message.result);
            //         }
            //         break;
            //     case "code.translate.inputError":
            //         window.showInformationMessage(
            //             "Enter algorithm to be translated."
            //         );
            //         break;
            // }
        });
    }
}