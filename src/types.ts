export type Device = { id: string; name: string; model: string; project: string; location: string; value: number | null; unit: string; lastSeen: number | null; status: 'online' | 'offline' | 'warning' | 'revoked'; protocol: string; demo?: boolean };
export type Period = '1h' | '24h' | '7d';
export type Alert = { id: string; title: string; name: string; lastSeen: number };
export type Snapshot = { devices: Device[]; points: number; activity: {time: number; messages: number}[]; alerts: Alert[] };
export type Runtime = { preferences: Preferences; version: string; platform: string; dataPath: string; settings: {host: string; port: number}; receiver: {running: boolean; error: string; addresses: string[]; port: number} };
export type Registration = { name: string; model: string; project: string; location: string };
export type Reading = { value: number; unit: string; time: number };
declare global {
  interface Window {
    wasl: {
      snapshot(period: Period): Promise<Snapshot>;
      createDevice(input: Registration): Promise<{device: Device; token: string}>;
      history(id: string): Promise<Reading[]>;
      rotateToken(id: string): Promise<{token: string}>;
      revokeToken(id: string): Promise<{revoked: boolean}>;
      runtime(): Promise<Runtime>;
      saveSettings(input: {host: string; port: number}): Promise<Runtime>;
      exportDevices(): Promise<{canceled: boolean}>;
      backup(): Promise<{canceled: boolean}>;
      ready(): void;
      preferences(input: Preferences): Promise<Preferences>;
      ide: {
        state(): Promise<IDEState>;
        draft(files: SketchFile[]): Promise<{saved:boolean}>;
        save(files: SketchFile[]): Promise<Sketch>;
        newSketch(): Promise<Sketch>;
        open(): Promise<Sketch|null>;
        exportSketch(): Promise<string|null>;
        refresh(): Promise<IDEState>;
        compile(input: {fqbn:string;files:SketchFile[]}): Promise<IDEState>;
        upload(input: {fqbn:string;port:string;files:SketchFile[]}): Promise<IDEState>;
        installCore(core:string): Promise<IDEState>;
        monitorStart(input:{fqbn:string;port:string;baud:number}): Promise<IDEState>;
        monitorSend(input:{text:string;ending:string}): Promise<{sent:boolean}>;
        stop(): Promise<{stopping:boolean}>;
        clearLogs(): Promise<IDEState>;
        exportTools(): Promise<string|null>;
        importTools(): Promise<IDEState|null>;
        addLibrary(): Promise<IDEState|null>;
      };
    };
  }
}
export type Preferences = { appLanguage: 'ar' | 'en'; terminalLanguage: 'ar' | 'en' };
export type SketchFile = { name: string; content: string };
export type Sketch = { name: string; main: string; folder: string; files: SketchFile[] };
export type IDELog = { id: number; kind: 'system' | 'raw'; key?: string; values?: Record<string, string | number>; text?: string; stream?: string; time: number };
export type IDEState = { sketch: Sketch; dirty: boolean; boards: {name:string;fqbn:string}[]; ports: {port:{address:string;label?:string;protocol:string};matching_boards?:{name:string;fqbn:string}[]}[]; cores:{id:string;installed:string;latest:string;name?:string}[]; busy:boolean; monitoring:boolean; logs:IDELog[]; cliAvailable:boolean; toolchainPath:string; platform:string };
