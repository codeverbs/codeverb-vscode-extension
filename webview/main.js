// import Microphone from "../src/utils/microphone.js";
// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Global variable to hold transcribed speech
let transcription = "";

// Wait for DOM to load before running main
window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
    const convertBtn1 = document.getElementById("convertButton1");
    convertBtn1.addEventListener("click", () => {
        algoToPython();
    });
    const convertBtn2 = document.getElementById("convertButton2");
    convertBtn2.addEventListener("click", () => {
        speechToPython();
    });
    const insertBtn = document.getElementById("insertButton");
    insertBtn.addEventListener("click", () => {
        insertCodeSignal();
    });
    const startRecordBtn = document.getElementById("startRecordBtn");
    startRecordBtn.addEventListener("click", () => {
        startRecording();
    });
    const stopRecordBtn = document.getElementById("stopRecordBtn");
    stopRecordBtn.addEventListener("click", () => {
        stopRecording();
    });
    webviewMessageListener();
}

// Sends a message to the extension context to convert the algorithm to python
function algoToPython() {
    const algoInput = document.getElementById("algoInput").value;
    if (algoInput.length > 0) {
        const convertBtn = document.getElementById("convertButton1");
        convertBtn.disabled = true;
        vscode.postMessage({
            command: "code.convert",
            input: algoInput,
            type: "Algo2Python"
        });
    } 
    else {
        vscode.postMessage({
            command: "code.convert.error.algoEmpty",
        });
    }
}

// Sends a message to the extension context to convert the transcribed speech to python
function speechToPython() {
    if(transcription.length > 0) {
        const convertBtn = document.getElementById("convertButton2");
        convertBtn.disabled = true;
        vscode.postMessage({
            command: "code.convert",
            input: transcription,
            type: "Text2Python"
        });
    }
    else {
        vscode.postMessage({
            command: "code.convert.error.transcriptionEmpty",
        });
    }
}

// Sends a message to the extension context to insert the code into the active editor
function insertCodeSignal() {
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
        const convertBtn1 = document.getElementById("convertButton1");
        const convertBtn2 = document.getElementById("convertButton2");
        const sttOutput = document.getElementById("sttOutput");
        switch (command) {
            case "code.convert.success":
                displayData(event.data.payload);
                convertBtn1.disabled = false;
                convertBtn2.disabled = false;
                break;
            case "code.convert.processing":
                displayData("# Processing...\n# This may take some time");
                break;
            case "code.convert.error":
                displayData("Error: " + event.data.payload);
                convertBtn1.disabled = false;
                convertBtn2.disabled = false;
                break;
            case "code.transcription.success":
                transcription = event.data.payload;
                sttOutput.innerHTML = `<span style="font-weight: 600;">${event.data.payload}</span>`;
                break;
            case "code.transcription.error":
                transcription = "";
                sttOutput.innerHTML = `<span style="color: darkorange; font-weight: 600;"><i>Something went wrong! Please try again.</i></span>`;
                break;
            case "code.transcription.status":
                transcription = "";
                sttOutput.innerHTML = `<span style="color: grey;"><i>${event.data.payload}</i></span>`;
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

function recordAudio() {
    return new Promise(async resolve => {
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            console.error('Failed to get media stream!', e);
            return;
        }
        if (!(stream instanceof MediaStream)) {
            console.error('Invalid media stream!');
            return;
        }
        const mediaRecorder = new MediaRecorder(stream);
        let audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", event => {
            audioChunks.push(event.data);
        });
        const start = () => {
            audioChunks = [];
            mediaRecorder.start();
        };
    
        const stop = () => {
            return new Promise(resolve => {
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                const play = () => audio.play();
                resolve({ audioBlob, audioUrl, play });
            });
    
            mediaRecorder.stop();
            });
        };
        resolve({ start, stop });
    });
};

function startRecording() {
    document.getElementById('startRecordBtn').disabled = true;
    document.getElementById('stopRecordBtn').disabled = false;
    vscode.postMessage({
        command: "code.startRecording",
    });
    // console.log('Recording started ...');
}

function stopRecording() {
    document.getElementById('startRecordBtn').disabled = false;
    document.getElementById('stopRecordBtn').disabled = true;
    vscode.postMessage({
        command: "code.stopRecording",
    });
    // console.log('Recording stopped ...');
}