import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { WebContainer } from '@webcontainer/api';
import { files } from './files';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
@Component({
  selector: 'app-webcontainer',
  templateUrl: './webcontainer.component.html',
  styleUrl: './webcontainer.component.scss',
})
export class WebContainerComponent implements OnInit {
  fileContents: string = files['index.js'].file.contents;
  @ViewChild('preview', { static: false }) preview: ElementRef | undefined;
  @ViewChild('terminal', { static: false }) terminalElement:
    | ElementRef
    | undefined;
  terminal: any;
  webContainerInstance: WebContainer | undefined;
  shellProcess: any;
  constructor(private renderer2: Renderer2) {}

  ngOnInit(): void {
    this.init();
  }

  async init() {
    this.webContainerInstance = await WebContainer.boot();
    if (!this.webContainerInstance) {
      return;
    }

    // Mount files
    await this.webContainerInstance.mount(files as any);

    const packageJson = await this.webContainerInstance.fs.readFile(
      'package.json',
      'utf8'
    );
    console.log(packageJson);
    this.createTerminal();

    const exitCode = await this.installDependencies();
    if (exitCode !== 0) {
      throw new Error('Installation failed');
    }
    this.startDevServer();
  }

  async installDependencies() {
    // Install dependencies
    const installProcess = await this.webContainerInstance?.spawn('npm', [
      'install',
    ]);
    const terminal = this.terminal;
    installProcess?.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        },
      })
    );
    // Wait for install command to exit
    return installProcess?.exit;
  }

  async startDevServer() {
    // Run `npm run start` to start the Express app
    const serverProcess = await this.webContainerInstance?.spawn('npm', [
      'run',
      'start',
    ]);
    const terminal = this.terminal;
    serverProcess?.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        },
      })
    );
    // Wait for `server-ready` event
    this.webContainerInstance?.on('server-ready', (port, url) => {
      this.renderer2.setProperty(this.preview?.nativeElement, 'src', url);
    });

    this.shellProcess = this.startShell(this.terminal);
  }

  async writeIndexJs(content: string) {
    await this.webContainerInstance?.fs.writeFile('index.js', content);
  }

  createTerminal() {
    const fitAddon = new FitAddon();
    this.terminal = new Terminal({
      convertEol: true, // convert \r\n to \n
    });
    this.terminal.open(this.terminalElement?.nativeElement);
    fitAddon.fit();
  }

  async startShell(terminal: any) {
    const shellProcess = await this.webContainerInstance?.spawn('jsh', {
      terminal: {
        rows: terminal.rows,
        cols: terminal.cols,
      },
    });
    shellProcess?.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        },
      })
    );

    const input = shellProcess?.input.getWriter();
    // handle input terminal
    terminal.onData((data: any) => {
      input?.write(data);
    });

    return shellProcess;
  }

  onEditChange(event: any) {
    this.writeIndexJs(event);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.responsiveShell();
  }

  responsiveShell() {
    this.terminal?.fit();
    this.shellProcess.resize({
      cols: this.terminal.cols,
      rows: this.terminal.rows,
    });
  }
}
