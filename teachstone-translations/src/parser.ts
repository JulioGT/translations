import * as ts from "typescript";
import { MessageObject, NestedMessageObject, ParsedFile } from "./types";

export class MessageParser {
  static parseMessagesFile(content: string): ParsedFile {
    const sourceFile = ts.createSourceFile(
      "messages.ts",
      content,
      ts.ScriptTarget.Latest,
      true
    );

    const result: ParsedFile = {
      exports: {},
      messages: {},
    };

    const visit = (node: ts.Node) => {
      if (ts.isVariableStatement(node)) {
        node.declarationList.declarations.forEach((declaration) => {
          if (
            ts.isIdentifier(declaration.name) &&
            declaration.initializer &&
            ts.isObjectLiteralExpression(declaration.initializer)
          ) {
            const varName = declaration.name.text;
            const parsed = this.parseObjectLiteral(declaration.initializer);
            result.exports[varName] = parsed;
            result.messages = { ...result.messages, ...parsed };
          }
        });
      }

      if (ts.isExportAssignment(node) || ts.isExportDeclaration(node)) {
        // Handle export statements
        if (
          ts.isExportAssignment(node) &&
          ts.isObjectLiteralExpression(node.expression)
        ) {
          const parsed = this.parseObjectLiteral(node.expression);
          result.exports.default = parsed;
          result.messages = { ...result.messages, ...parsed };
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return result;
  }

  private static parseObjectLiteral(
    node: ts.ObjectLiteralExpression
  ): NestedMessageObject {
    const result: NestedMessageObject = {};

    node.properties.forEach((property) => {
      if (ts.isPropertyAssignment(property)) {
        const key = this.getPropertyName(property.name);
        if (key) {
          if (ts.isStringLiteral(property.initializer)) {
            // Direct string value - create a MessageObject
            result[key] = {
              key,
              defaultValue: property.initializer.text,
            };
          } else if (ts.isObjectLiteralExpression(property.initializer)) {
            // Check if this object literal is a MessageObject or NestedMessageObject
            const hasKeyAndDefaultValue = this.isMessageObject(
              property.initializer
            );

            if (hasKeyAndDefaultValue) {
              // This is a MessageObject - extract key and defaultValue
              const messageObj = this.extractMessageObject(
                property.initializer
              );
              if (messageObj) {
                result[key] = messageObj;
                console.log(
                  `✅ Parsed MessageObject: ${key} -> "${messageObj.defaultValue}"`
                );
              }
            } else {
              // This is a nested object - recurse
              console.log(`🔄 Parsing nested object: ${key}`);
              result[key] = this.parseObjectLiteral(property.initializer);
            }
          } else if (
            ts.isTemplateExpression(property.initializer) ||
            ts.isNoSubstitutionTemplateLiteral(property.initializer)
          ) {
            // Template literal - preserve the original text
            const templateText = property.initializer.getFullText();
            result[key] = {
              key,
              defaultValue: templateText.trim().replace(/^`|`$/g, ""), // Remove backticks
            };
          }
        }
      }
    });

    return result;
  }

  private static isMessageObject(node: ts.ObjectLiteralExpression): boolean {
    let hasKey = false;
    let hasDefaultValue = false;

    node.properties.forEach((prop) => {
      if (ts.isPropertyAssignment(prop)) {
        const propName = this.getPropertyName(prop.name);
        if (propName === "key") hasKey = true;
        if (propName === "defaultValue") hasDefaultValue = true;
      }
    });

    return hasKey && hasDefaultValue;
  }

  private static extractMessageObject(
    node: ts.ObjectLiteralExpression
  ): MessageObject | null {
    let key = "";
    let defaultValue = "";

    node.properties.forEach((prop) => {
      if (ts.isPropertyAssignment(prop)) {
        const propName = this.getPropertyName(prop.name);

        if (propName === "key") {
          if (ts.isStringLiteral(prop.initializer)) {
            key = prop.initializer.text;
          } else if (
            ts.isTemplateExpression(prop.initializer) ||
            ts.isNoSubstitutionTemplateLiteral(prop.initializer)
          ) {
            // Handle template literals like `${PATH}.key_name`
            key = prop.initializer.getFullText().trim().replace(/^`|`$/g, "");
          }
        }

        if (propName === "defaultValue") {
          if (ts.isStringLiteral(prop.initializer)) {
            defaultValue = prop.initializer.text;
          } else if (
            ts.isTemplateExpression(prop.initializer) ||
            ts.isNoSubstitutionTemplateLiteral(prop.initializer)
          ) {
            defaultValue = prop.initializer
              .getFullText()
              .trim()
              .replace(/^`|`$/g, "");
          }
        }
      }
    });

    if (key && defaultValue) {
      return { key, defaultValue };
    }

    console.warn(
      `⚠️ Could not extract MessageObject - key: "${key}", defaultValue: "${defaultValue}"`
    );
    return null;
  }

  private static getPropertyName(name: ts.PropertyName): string | null {
    if (ts.isIdentifier(name)) {
      return name.text;
    } else if (ts.isStringLiteral(name)) {
      return name.text;
    } else if (ts.isNumericLiteral(name)) {
      return name.text;
    }
    return null;
  }

  static extractDefaultValues(messages: NestedMessageObject): string[] {
    const values: string[] = [];

    for (const value of Object.values(messages)) {
      if ("key" in value && "defaultValue" in value) {
        // This is a MessageObject
        values.push((value as MessageObject).defaultValue);
      } else {
        // This is a nested object - recurse
        values.push(...this.extractDefaultValues(value as NestedMessageObject));
      }
    }

    return values;
  }
}
