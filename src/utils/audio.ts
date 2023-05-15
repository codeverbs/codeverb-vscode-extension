import { spawn } from 'child_process';
import * as path from "path";

const scriptPath: string = path.join(__dirname, "..", "src", "utils", "transcribe.py");
const soxPath: string = path.join(__dirname, '..', 'drivers', 'sox', 'sox');
const tempPath: string = path.join(__dirname, "..", "assets", "temp2.wav");

export function convertAudio(finalAudio: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
		const conv = spawn(soxPath, [tempPath, '-b', '16', '-e', 'signed-integer', finalAudio]);
		conv.on('close', (code: number) => {
			console.log(`Conversion finished with code ${code}`);
			resolve();
		});
		conv.on('error', (err: Error) => {
			console.error(`Conversion error: ${err}`);
			reject(err);
		});
    });
}

export function fixAudio(filePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
		const conv = spawn(soxPath, ['--ignore-length', filePath, tempPath]);
		conv.on('close', (code: number) => {
			console.log(`Conversion finished with code ${code}`);
			resolve();
		});
		conv.on('error', (err: Error) => {
			console.error(`Conversion error: ${err}`);
			reject(err);
		});
    });
}


export function transcribeAudio(audioFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
		const pythonProcess = spawn('python', [scriptPath, audioFilePath]);
		let transcription = '';
		pythonProcess.stdout.on('data', (data: Buffer) => {
			transcription += data.toString();
		});
		pythonProcess.stderr.on('data', (data: Buffer) => {
			console.error(data.toString());
			reject(data.toString());
		});
		pythonProcess.on('close', (code: number) => {
			if (code === 0) {
				resolve(transcription);
			} 
			else {
				reject(`Python process exited with code ${code}`);
			}
		});
  });
}