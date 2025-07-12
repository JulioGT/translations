import { HuggingFaceResponse, TranslationError } from "./types";
// Add node-fetch for Node.js environment
declare const fetch: any;

export class HuggingFaceAPI {
  private apiKey: string;
  private baseUrl = "https://api-inference.huggingface.co/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translateBatch(
    texts: string[],
    targetLanguage: string
  ): Promise<string[]> {
    const results: string[] = [];

    for (const text of texts) {
      try {
        const translation = await this.translateSingle(text, targetLanguage);
        results.push(translation);
      } catch (error) {
        console.error(`Failed to translate "${text}":`, error);
        // Return original text if translation fails
        results.push(text);
      }
    }

    return results;
  }

  public async translateSingle(
    text: string,
    targetLanguage: string
  ): Promise<string> {
    // Use the most popular and reliable Helsinki-NLP OPUS models
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

    console.log(
      `🔄 Translating to ${targetLanguage}: "${text}" with model ${model}`
    );

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
        console.error(`❌ API Error ${response.status}:`, errorText);

        // Check if model is loading
        if (response.status === 503) {
          throw new TranslationError(
            `Model is loading, please try again in a few minutes. Status: ${response.status}`
          );
        }

        throw new TranslationError(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`📝 Raw API response:`, result);

      // Handle different response formats
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
        console.error(`❌ No translation found in response:`, result);
        throw new TranslationError(
          `Invalid response format: ${JSON.stringify(result)}`
        );
      }

      console.log(`✅ Translated "${text}" -> "${translatedText}"`);
      return translatedText.trim();
    } catch (error) {
      if (error instanceof TranslationError) {
        throw error;
      }
      console.error(`❌ Translation request failed:`, error);
      throw new TranslationError(
        `Translation request failed: ${error}`,
        error as Error
      );
    }
  }
}
