import * as vscode from "vscode";
import { Logger } from "../types";

export class ExtensionLogger implements Logger {
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel(
      "Teachstone Translations"
    );
  }

  info(message: string): void {
    this.outputChannel.appendLine(`[INFO] ${message}`);
  }

  warn(message: string): void {
    this.outputChannel.appendLine(`[WARN] ${message}`);
  }

  error(message: string, error?: Error): void {
    this.outputChannel.appendLine(`[ERROR] ${message}`);
    if (error) {
      this.outputChannel.appendLine(`[ERROR] ${error.message}`);
      if (error.stack) {
        this.outputChannel.appendLine(`[ERROR] ${error.stack}`);
      }
    }
  }

  showOutput(): void {
    this.outputChannel.show();
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}
