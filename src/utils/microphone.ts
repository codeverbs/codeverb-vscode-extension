import * as os from "os";
import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";
import * as path from "path";

const isMac: boolean = os.type() === 'Darwin';
const isWin: boolean = os.type().indexOf('Windows') > -1;
const soxPath: string = path.join(__dirname, '..', 'drivers', 'sox', 'sox');

interface MicrophoneOptions {
    endian?: string;
    bitwidth?: string;
    encoding?: string;
    rate?: string;
    channels?: string;
    device?: string;
    additionalParameters?: Array<string>;
    useDataEmitter?: boolean;
}

export default class Microphone extends EventEmitter {
    private ps: ChildProcess | null = null;
    private endian: string;
    private bitwidth: string;
    private encoding: string;
    private rate: string;
    private channels: string;
    private device: string | undefined;
    private format: string | undefined;
    private formatEndian: string | undefined;
    private formatEncoding: string | undefined;
    private additionalParameters: Array<string> | false;
    private useDataEmitter: boolean;

    constructor(options: MicrophoneOptions = {}) {
        super();
        this.endian = options.endian || 'little';
        this.bitwidth = options.bitwidth || '16';
        this.encoding = options.encoding || 'signed-integer';
        this.rate = options.rate || '16000';
        this.channels = options.channels || '1';
        this.additionalParameters = options.additionalParameters || false;
        this.useDataEmitter = !!options.useDataEmitter;

        if (isWin) {
            this.device = options.device || 'default';
        }

        if (!isWin && !isMac) {
            this.device = options.device || 'plughw:1,0';
            this.format = undefined;
            this.formatEndian = undefined;
            this.formatEncoding = undefined;

            if (this.encoding === 'unsigned-integer') {
                this.formatEncoding = 'U';
            } 
            else {
                this.formatEncoding = 'S';
            }

            if (this.endian === 'big') {
                this.formatEndian = 'BE';
            } 
            else {
                this.formatEndian = 'LE';
            }

            this.format = this.formatEncoding + this.bitwidth + '_' + this.formatEndian;
        }
    }

    public startRecording(): NodeJS.ReadableStream | null {
        let audioOptions: Array<string>;
        if (this.ps === null) {
            if (isWin) {
                audioOptions = [
                    '-b',
                    this.bitwidth,
                    '--endian',
                    this.endian,
                    '-c',
                    this.channels,
                    '-r',
                    this.rate,
                    '-e',
                    this.encoding,
                    '-t',
                    'waveaudio',
                    this.device!,
                    '-p',
                ];

                if (this.additionalParameters) {
                    audioOptions = audioOptions.concat(
                        this.additionalParameters
                    );
                }

                this.ps = spawn(soxPath, audioOptions);
            } else if (isMac) {
                audioOptions = [
                    '-q',
                    '-b',
                    this.bitwidth,
                    '-c',
                    this.channels,
                    '-r',
                    this.rate,
                    '-e',
                    this.encoding,
                    '-t',
                    'wav',
                    '-',
                ];

                if (this.additionalParameters) {
                    audioOptions = audioOptions.concat(
                        this.additionalParameters
                    );
                }
                this.ps = spawn('rec', audioOptions);
            } else {
                audioOptions = [
                    '-c',
                    this.channels,
                    '-r',
                    this.rate,
                    '-f',
                    this.format!,
                    '-D',
                    this.device!,
                ];
                if (this.additionalParameters) {
                    audioOptions = audioOptions.concat(
                        this.additionalParameters
                    );
                }
                this.ps = spawn('arecord', audioOptions);
            }
            this.ps.on('error', (error: Error) => {
                this.emit('error', error);
            });
            this.ps.stderr?.on('error', (error: Error) => {
                this.emit('error', error);
            });
            this.ps.stderr?.on('data', (info: Buffer) => {
                this.emit('info', info);
            });
            if (this.useDataEmitter) {
                this.ps.stdout?.on('data', (data: Buffer) => {
                    this.emit('data', data);
                });
            }
            return this.ps.stdout;
        }
        return null;
    }
    public stopRecording(): void {
        if (this.ps) {
          this.ps.kill();
          this.ps = null;
        }
    }
}