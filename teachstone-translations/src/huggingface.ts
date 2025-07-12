import { TranslationError, Logger } from "./types";
import fetch from "node-fetch";

export class HuggingFaceAPI {
  private apiKey: string;
  private baseUrl = "https://api-inference.huggingface.co/models";
  private logger: Logger;

  constructor(apiKey: string, logger: Logger) {
    this.apiKey = apiKey;
    this.logger = logger;
  }

  public async translateSingle(
    text: string,
    targetLanguage: string
  ): Promise<string> {
    const modelMap: Record<string, string> = {
      es: "Helsinki-NLP/opus-mt-en-es",
      fr: "Helsinki-NLP/opus-mt-en-fr",
    };

    const model = modelMap[targetLanguage];
    if (!model) {
      throw new TranslationError(
        `Unsupported target language: ${targetLanguage}`
      );
    }

    const url = `${this.baseUrl}/${model}`;

    const payload = {
      inputs: text,
      parameters: {
        max_length: 512,
        do_sample: false,
      },
      options: {
        wait_for_model: true,
        use_cache: false,
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 503) {
          throw new TranslationError(
            `Model is loading, please try again in a few minutes. Status: ${response.status}`
          );
        }

        throw new TranslationError(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      let translatedText = "";

      if (Array.isArray(result) && result.length > 0) {
        if (result[0].translation_text) {
          translatedText = result[0].translation_text;
        } else if (result[0].generated_text) {
          translatedText = result[0].generated_text;
        } else if (typeof result[0] === "string") {
          translatedText = result[0];
        }
      } else if (result.translation_text) {
        translatedText = result.translation_text;
      } else if (result.generated_text) {
        translatedText = result.generated_text;
      } else if (typeof result === "string") {
        translatedText = result;
      }

      if (!translatedText) {
        throw new TranslationError(
          `Invalid response format: ${JSON.stringify(result)}`
        );
      }

      return translatedText.trim();
    } catch (error) {
      if (error instanceof TranslationError) {
        throw error;
      }
      throw new TranslationError(
        `Translation request failed: ${error}`,
        error as Error
      );
    }
  }
}
