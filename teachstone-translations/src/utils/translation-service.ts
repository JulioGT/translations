import { HuggingFaceAPI } from "../huggingface";
import { TemplatePreservation } from "./template-preservation";
import { MessageObject, NestedMessageObject, Logger } from "../types";
import { TranslationFormatter } from "../formatter";

export class TranslationService {
  private translator: HuggingFaceAPI;
  private templatePreservation: TemplatePreservation;
  private logger: Logger;

  constructor(apiKey: string, logger: Logger) {
    this.translator = new HuggingFaceAPI(apiKey, logger);
    this.templatePreservation = new TemplatePreservation(logger);
    this.logger = logger;
  }

  async translateMessageObject(
    messageObj: MessageObject,
    targetLanguages: string[]
  ): Promise<Record<string, MessageObject>> {
    const result: Record<string, MessageObject> = {};

    if (
      !messageObj.defaultValue ||
      typeof messageObj.defaultValue !== "string"
    ) {
      this.logger.warn(
        `Invalid defaultValue for key "${messageObj.key}": ${messageObj.defaultValue}`
      );
      targetLanguages.forEach((lang) => {
        result[lang] = messageObj;
      });
      return result;
    }

    const { text: textToTranslate, templates } =
      this.templatePreservation.extractTemplateLiterals(
        messageObj.defaultValue
      );

    for (const lang of targetLanguages) {
      try {
        const translatedWithPlaceholders =
          await this.translator.translateSingle(textToTranslate, lang);

        const finalTranslation =
          this.templatePreservation.restoreTemplateLiterals(
            translatedWithPlaceholders,
            templates
          );

        result[lang] = {
          key: messageObj.key,
          defaultValue: finalTranslation,
        };
      } catch (error) {
        this.logger.error(`Translation failed for ${lang}`, error as Error);
        result[lang] = messageObj;
      }
    }

    return result;
  }

  async translateNestedObject(
    obj: NestedMessageObject,
    targetLanguages: string[]
  ): Promise<Record<string, NestedMessageObject>> {
    const results: Record<string, NestedMessageObject> = {};

    // Initialize results for all languages including English
    ["en", ...targetLanguages].forEach((lang) => {
      results[lang] = {};
    });

    for (const [key, value] of Object.entries(obj)) {
      if ("key" in value && "defaultValue" in value) {
        const translations = await this.translateMessageObject(
          value as MessageObject,
          targetLanguages
        );

        // Add English version (original text)
        results["en"][key] = value as MessageObject;

        // Add translated versions
        targetLanguages.forEach((lang) => {
          results[lang][key] = translations[lang];
        });
      } else {
        const nestedTranslations = await this.translateNestedObject(
          value as NestedMessageObject,
          targetLanguages
        );

        // Add English version (original nested object)
        results["en"][key] = value as NestedMessageObject;

        // Add translated versions
        targetLanguages.forEach((lang) => {
          results[lang][key] = nestedTranslations[lang];
        });
      }
    }

    return results;
  }

  // Format all languages including English
  formatAllLanguages(
    translatedStructures: Record<string, NestedMessageObject>
  ): Record<string, string> {
    const formatted: Record<string, string> = {};

    // Format English first (alphabetically it will be first)
    if (translatedStructures.en) {
      formatted.en = TranslationFormatter.formatTranslation(
        translatedStructures.en
      );
    }

    // Format other languages
    Object.entries(translatedStructures).forEach(([lang, structure]) => {
      if (lang !== "en") {
        formatted[lang] = TranslationFormatter.formatTranslation(structure);
      }
    });

    return formatted;
  }
}
