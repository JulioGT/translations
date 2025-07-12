import * as vscode from "vscode";
import { MessageParser } from "./parser";
import { TranslationError } from "./types";
import { ExtensionLogger } from "./utils/logger";
import { TranslationService } from "./utils/translation-service";
import { UIGenerator } from "./utils/ui-generator";

export function activate(context: vscode.ExtensionContext) {
  const logger = new ExtensionLogger();

  try {
    logger.info("Teachstone Translations extension activated");

    // Set up logger for parser
    MessageParser.setLogger(logger);

    // Test command
    const testCommand = vscode.commands.registerCommand(
      "teachstone-translations.test",
      () => {
        vscode.window.showInformationMessage(
          "✨ Teachstone Translations is working perfectly!"
        );
      }
    );

    // Main translation command
    const translateCommand = vscode.commands.registerCommand(
      "teachstone-translations.translate",
      async () => {
        await handleTranslation(logger);
      }
    );

    context.subscriptions.push(testCommand, translateCommand, logger);

    logger.info("Teachstone Translations extension activated successfully");
  } catch (error) {
    logger.error("Extension activation failed", error as Error);
    vscode.window.showErrorMessage(`Extension activation failed: ${error}`);
  }
}

async function handleTranslation(logger: ExtensionLogger): Promise<void> {
  const startTime = Date.now();

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("Please open a messages file first");
    return;
  }

  const config = vscode.workspace.getConfiguration("teachstoneTranslations");
  const apiKey = config.get<string>("huggingFaceApiKey");

  if (!apiKey) {
    const action = await vscode.window.showErrorMessage(
      "Hugging Face API key not found. Please set it in settings.",
      "Open Settings"
    );

    if (action === "Open Settings") {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "teachstoneTranslations.huggingFaceApiKey"
      );
    }
    return;
  }

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "🌍 Teachstone Translations",
        cancellable: true,
      },
      async (progress, token) => {
        await performTranslation(
          editor,
          apiKey,
          logger,
          progress,
          token,
          startTime
        );
      }
    );
  } catch (error) {
    logger.error("Translation error", error as Error);
    if (error instanceof TranslationError) {
      vscode.window.showErrorMessage(`Translation error: ${error.message}`);
    } else {
      vscode.window.showErrorMessage(
        `Unexpected error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

async function performTranslation(
  editor: vscode.TextEditor,
  apiKey: string,
  logger: ExtensionLogger,
  progress: vscode.Progress<{ message?: string; increment?: number }>,
  token: vscode.CancellationToken,
  startTime: number
): Promise<void> {
  // Parse the file
  progress.report({
    message: "📖 Parsing messages file...",
    increment: 10,
  });

  const fileContent = editor.document.getText();
  const parsedFile = MessageParser.parseMessagesFile(fileContent);

  if (Object.keys(parsedFile.messages).length === 0) {
    vscode.window.showWarningMessage(
      "No messages found to translate in this file."
    );
    return;
  }

  const translationService = new TranslationService(apiKey, logger);
  const targetLanguages = ["es", "fr"];

  progress.report({
    message: "🔄 Processing translations...",
    increment: 20,
  });

  // Process all translations (including English formatting)
  const translatedStructures = await translationService.translateNestedObject(
    parsedFile.messages,
    targetLanguages
  );

  if (token.isCancellationRequested) return;

  progress.report({
    message: "✨ Formatting output...",
    increment: 30,
  });

  // Format all languages including English
  const formattedTranslations =
    translationService.formatAllLanguages(translatedStructures);

  // Ensure we have all required languages
  const translations = {
    en: formattedTranslations.en || "",
    es: formattedTranslations.es || "",
    fr: formattedTranslations.fr || "",
  };

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Show results in webview with timing metrics
  showTranslationsPreview(translations, {
    duration,
    messageCount: Object.keys(parsedFile.messages).length,
    languages: ["en", ...targetLanguages],
  });

  progress.report({
    message: "🎉 Translation complete!",
    increment: 40,
  });
}

function showTranslationsPreview(
  translations: {
    en: string;
    es: string;
    fr: string;
  },
  metrics: {
    duration: number;
    messageCount: number;
    languages: string[];
  }
): void {
  const panel = vscode.window.createWebviewPanel(
    "translationsPreview",
    "🌍 Teachstone Translations",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = UIGenerator.generateTranslationsPreview(
    translations,
    metrics
  );
}

export function deactivate() {
  // Cleanup is handled by the ExtensionLogger dispose method
}
