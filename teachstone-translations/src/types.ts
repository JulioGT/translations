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

export interface HuggingFaceResponse {
  translation_text: string;
}

export class TranslationError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "TranslationError";
  }
}
