import { Logger } from "../types";

export interface TemplateExtraction {
  text: string;
  templates: string[];
}

export class TemplatePreservation {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  extractTemplateLiterals(text: string): TemplateExtraction {
    const templates: string[] = [];

    if (!text || typeof text !== "string") {
      this.logger.warn(`Invalid text input: ${typeof text} - "${text}"`);
      return { text: String(text || ""), templates: [] };
    }

    let modifiedText = text;
    const matches = text.match(/\{\{[^}]+\}\}/g);

    if (matches) {
      matches.forEach((match, index) => {
        templates.push(match);
        const placeholder = `XXTMPLXX${Buffer.from(
          `TEMPLATE_${index}`,
          "utf8"
        ).toString("base64")}XXTMPLXX`;
        modifiedText = modifiedText.replace(match, placeholder);
      });
    }

    return { text: modifiedText, templates };
  }

  restoreTemplateLiterals(text: string, templates: string[]): string {
    let restoredText = text;

    templates.forEach((template, index) => {
      const originalPlaceholder = `XXTMPLXX${Buffer.from(
        `TEMPLATE_${index}`,
        "utf8"
      ).toString("base64")}XXTMPLXX`;

      if (restoredText.includes(originalPlaceholder)) {
        restoredText = restoredText.replace(
          new RegExp(
            originalPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "g"
          ),
          template
        );
      } else {
        const base64Pattern = /XXTMPLXX[A-Za-z0-9+/=]+XXTMPLXX/g;
        const foundPlaceholders = restoredText.match(base64Pattern);

        if (foundPlaceholders && foundPlaceholders.length > index) {
          restoredText = restoredText.replace(
            foundPlaceholders[index],
            template
          );
        } else {
          const fallbackPatterns = [
            /\{\{[^}]*\}\}/g,
            new RegExp(`template.?${index}`, "gi"),
            new RegExp(`plantilla.?${index}`, "gi"),
            new RegExp(`modèle.?${index}`, "gi"),
          ];

          let restored = false;
          for (const pattern of fallbackPatterns) {
            const matches = restoredText.match(pattern);
            if (matches && matches[0] !== template) {
              restoredText = restoredText.replace(matches[0], template);
              restored = true;
              break;
            }
          }

          if (!restored && !restoredText.includes(template)) {
            restoredText += ` ${template}`;
            this.logger.warn(`Force-added template: ${template}`);
          }
        }
      }
    });

    return restoredText;
  }
}
