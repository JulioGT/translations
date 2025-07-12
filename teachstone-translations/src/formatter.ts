import { NestedMessageObject, MessageObject } from "./types";

export class TranslationFormatter {
  // Convert camelCase to snake_case
  private static toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, ""); // Remove leading underscore if present
  }

  // Sort object keys alphabetically (recursively)
  private static sortObjectAlphabetically(
    obj: NestedMessageObject
  ): NestedMessageObject {
    const sortedObj: NestedMessageObject = {};

    // Get all keys and sort them alphabetically
    const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b));

    for (const key of sortedKeys) {
      const value = obj[key];
      if ("key" in value && "defaultValue" in value) {
        // This is a message object - keep as is but update the key in the object
        const messageObj = value as MessageObject;
        sortedObj[key] = {
          ...messageObj,
          key: this.toSnakeCase(messageObj.key),
        };
      } else {
        // This is a nested object - recursively sort it
        sortedObj[key] = this.sortObjectAlphabetically(
          value as NestedMessageObject
        );
      }
    }

    return sortedObj;
  }

  static formatTranslation(messages: NestedMessageObject): string {
    const lines: string[] = [];

    // First, sort the entire structure alphabetically
    const sortedMessages = this.sortObjectAlphabetically(messages);

    const formatNestedObject = (
      obj: NestedMessageObject,
      depth: number = 0
    ): void => {
      const indent = "  ".repeat(depth);

      // Get sorted keys for this level
      const sortedKeys = Object.keys(obj).sort((a, b) => a.localeCompare(b));

      for (const key of sortedKeys) {
        const value = obj[key];
        const snakeCaseKey = this.toSnakeCase(key);

        if ("key" in value && "defaultValue" in value) {
          // This is a message object
          const messageObj = value as MessageObject;
          lines.push(`${indent}${snakeCaseKey}: ${messageObj.defaultValue}`);
        } else {
          // This is a nested object
          lines.push(`${indent}${snakeCaseKey}:`);
          formatNestedObject(value as NestedMessageObject, depth + 1);
        }
      }
    };

    formatNestedObject(sortedMessages, 0);
    return lines.join("\n");
  }

  static formatOutput(translations: Record<string, string>): string {
    const lines: string[] = [];

    // Sort the keys alphabetically and convert to snake_case
    const sortedKeys = Object.keys(translations).sort((a, b) =>
      a.localeCompare(b)
    );

    for (const key of sortedKeys) {
      const snakeCaseKey = this.toSnakeCase(key);
      lines.push(`${snakeCaseKey}: ${translations[key]}`);
    }

    return lines.join("\n");
  }
}
