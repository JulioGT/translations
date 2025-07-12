export interface MessageObject {
  key: string;
  defaultValue: string;
}

export interface NestedMessageObject {
  [key: string]: MessageObject | NestedMessageObject;
}

export interface ParsedFile {
  exports: Record<string, any>;
  messages: NestedMessageObject;
}

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
}

export class TranslationError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "TranslationError";
  }
}
