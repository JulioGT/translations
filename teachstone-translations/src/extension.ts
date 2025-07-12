import * as vscode from "vscode";
import { HuggingFaceAPI } from "./huggingface";
import { MessageParser } from "./parser";
import { TranslationFormatter } from "./formatter";
import { TranslationError, NestedMessageObject, MessageObject } from "./types";

// Enhanced template literal preservation with ultra-secure placeholders
function extractTemplateLiterals(text: string): {
  text: string;
  templates: string[];
} {
  const templates: string[] = [];

  // Handle cases where text is not a string or is empty
  if (!text || typeof text !== "string") {
    console.log(`⚠️ Invalid text input: ${typeof text} - "${text}"`);
    return { text: String(text || ""), templates: [] };
  }

  let modifiedText = text;

  // Find all {{variable}} patterns
  const matches = text.match(/\{\{[^}]+\}\}/g);

  if (matches) {
    matches.forEach((match, index) => {
      templates.push(match);
      // Use BASE64-encoded placeholders that are impossible to translate
      const placeholder = `XXTMPLXX${Buffer.from(
        `TEMPLATE_${index}`,
        "utf8"
      ).toString("base64")}XXTMPLXX`;
      modifiedText = modifiedText.replace(match, placeholder);
    });
  }

  console.log(`🔍 Template extraction from "${text}":`, {
    original: text,
    modified: modifiedText,
    templates,
    placeholderCount: templates.length,
  });
  return { text: modifiedText, templates };
}

// Enhanced restoration with bulletproof matching
function restoreTemplateLiterals(text: string, templates: string[]): string {
  let restoredText = text;
  console.log(`🔧 Starting restoration for: "${text}"`);
  console.log(`🔧 Templates to restore:`, templates);

  templates.forEach((template, index) => {
    const originalPlaceholder = `XXTMPLXX${Buffer.from(
      `TEMPLATE_${index}`,
      "utf8"
    ).toString("base64")}XXTMPLXX`;
    const beforeRestore = restoredText;

    // Try exact match first
    if (restoredText.includes(originalPlaceholder)) {
      restoredText = restoredText.replace(
        new RegExp(
          originalPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "g"
        ),
        template
      );
      console.log(`✅ Exact match restored: ${template}`);
    } else {
      // The API might have corrupted our placeholder, try to find any BASE64-like strings
      const base64Pattern = /XXTMPLXX[A-Za-z0-9+/=]+XXTMPLXX/g;
      const foundPlaceholders = restoredText.match(base64Pattern);

      if (foundPlaceholders && foundPlaceholders.length > index) {
        restoredText = restoredText.replace(foundPlaceholders[index], template);
        console.log(
          `✅ Pattern match restored: ${foundPlaceholders[index]} -> ${template}`
        );
      } else {
        // Last resort: look for any remaining template-like patterns
        const fallbackPatterns = [
          /\{\{[^}]*\}\}/g, // Any remaining template literals
          new RegExp(`template.?${index}`, "gi"), // "template 0", "template_0", etc.
          new RegExp(`plantilla.?${index}`, "gi"), // Spanish
          new RegExp(`modèle.?${index}`, "gi"), // French
        ];

        let restored = false;
        for (const pattern of fallbackPatterns) {
          const matches = restoredText.match(pattern);
          if (matches && matches[0] !== template) {
            restoredText = restoredText.replace(matches[0], template);
            console.log(
              `🔄 Fallback restoration: ${matches[0]} -> ${template}`
            );
            restored = true;
            break;
          }
        }

        if (!restored) {
          console.log(`❌ Could not restore template ${index}: "${template}"`);
          console.log(`❌ Available text: "${restoredText}"`);
          // Force insert the template at the end if all else fails
          if (!restoredText.includes(template)) {
            restoredText += ` ${template}`;
            console.log(`🚨 Force-added template: ${template}`);
          }
        }
      }
    }

    if (beforeRestore === restoredText) {
      console.log(`⚠️ No change made for template ${index}: "${template}"`);
    }
  });

  console.log(`🎯 Final restored text: "${restoredText}"`);
  return restoredText;
}

// Process a single message object with enhanced template preservation
async function translateMessageObject(
  messageObj: MessageObject,
  translator: HuggingFaceAPI,
  targetLanguages: string[]
): Promise<Record<string, MessageObject>> {
  const result: Record<string, MessageObject> = {};

  // Add validation and logging for debugging
  console.log(`🔍 Input validation for message object:`, {
    key: messageObj.key,
    defaultValue: messageObj.defaultValue,
    defaultValueType: typeof messageObj.defaultValue,
    hasDefaultValue: "defaultValue" in messageObj,
    messageObj: JSON.stringify(messageObj, null, 2),
  });

  // Ensure defaultValue is a string
  if (!messageObj.defaultValue || typeof messageObj.defaultValue !== "string") {
    console.warn(
      `⚠️ Invalid defaultValue for key "${messageObj.key}":`,
      messageObj.defaultValue
    );
    // Return the original object for all languages if defaultValue is invalid
    targetLanguages.forEach((lang) => {
      result[lang] = messageObj;
    });
    return result;
  }

  // Extract templates from the original text
  const { text: textToTranslate, templates } = extractTemplateLiterals(
    messageObj.defaultValue
  );

  console.log(`🌍 Processing message: "${messageObj.key}"`);
  console.log(`📝 Original: "${messageObj.defaultValue}"`);
  console.log(`🔄 To translate: "${textToTranslate}"`);
  console.log(`📋 Templates: ${JSON.stringify(templates)}`);

  for (const lang of targetLanguages) {
    try {
      // Translate the text with secure placeholders
      const translatedWithPlaceholders = await translator.translateSingle(
        textToTranslate,
        lang
      );
      console.log(
        `📝 ${lang.toUpperCase()} raw from API: "${translatedWithPlaceholders}"`
      );

      // Restore the templates with enhanced logic
      const finalTranslation = restoreTemplateLiterals(
        translatedWithPlaceholders,
        templates
      );

      result[lang] = {
        key: messageObj.key,
        defaultValue: finalTranslation,
      };

      console.log(`✨ ${lang.toUpperCase()} FINAL: "${finalTranslation}"`);
    } catch (error) {
      console.error(`❌ Translation failed for ${lang}:`, error);
      // Fallback to original text
      result[lang] = messageObj;
    }
  }

  return result;
}

// Process nested object structure recursively
async function translateNestedObject(
  obj: NestedMessageObject,
  translator: HuggingFaceAPI,
  targetLanguages: string[]
): Promise<Record<string, NestedMessageObject>> {
  const results: Record<string, NestedMessageObject> = {};

  // Initialize result structures
  targetLanguages.forEach((lang) => {
    results[lang] = {};
  });

  for (const [key, value] of Object.entries(obj)) {
    if ("key" in value && "defaultValue" in value) {
      // This is a message object
      const translations = await translateMessageObject(
        value as MessageObject,
        translator,
        targetLanguages
      );

      targetLanguages.forEach((lang) => {
        results[lang][key] = translations[lang];
      });
    } else {
      // This is a nested object - recurse
      const nestedTranslations = await translateNestedObject(
        value as NestedMessageObject,
        translator,
        targetLanguages
      );

      targetLanguages.forEach((lang) => {
        results[lang][key] = nestedTranslations[lang];
      });
    }
  }

  return results;
}

export function activate(context: vscode.ExtensionContext) {
  try {
    console.log("=== TEACHSTONE EXTENSION STARTING ===");

    // Simple test command
    let testCommand = vscode.commands.registerCommand(
      "teachstone-translations.test",
      () => {
        console.log("Test command executed!");
        vscode.window.showInformationMessage(
          "✨ Teachstone Translations is working perfectly!"
        );
      }
    );

    // Main translation command with full functionality
    let disposable = vscode.commands.registerCommand(
      "teachstone-translations.translate",
      async () => {
        console.log("🚀 Starting translation process...");

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("Please open a messages file first");
          return;
        }

        const config = vscode.workspace.getConfiguration(
          "teachstoneTranslations"
        );
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
            async (
              progress: vscode.Progress<{
                message?: string;
                increment?: number;
              }>,
              token: vscode.CancellationToken
            ) => {
              // Parse the file
              progress.report({
                message: "📖 Parsing messages file...",
                increment: 10,
              });
              const fileContent = editor.document.getText();
              const parsedFile = MessageParser.parseMessagesFile(fileContent);

              console.log("📁 Parsed file structure:", parsedFile);

              if (Object.keys(parsedFile.messages).length === 0) {
                vscode.window.showWarningMessage(
                  "No messages found to translate in this file."
                );
                return;
              }

              const translator = new HuggingFaceAPI(apiKey);
              const targetLanguages = ["es", "fr"];

              progress.report({
                message: "🔄 Processing translations...",
                increment: 20,
              });

              // Process all translations with enhanced template preservation
              const translatedStructures = await translateNestedObject(
                parsedFile.messages,
                translator,
                targetLanguages
              );

              if (token.isCancellationRequested) return;

              progress.report({
                message: "✨ Formatting output...",
                increment: 30,
              });

              // Format the results
              const translations = {
                es: TranslationFormatter.formatTranslation(
                  translatedStructures.es
                ),
                fr: TranslationFormatter.formatTranslation(
                  translatedStructures.fr
                ),
              };

              console.log("🎯 Final formatted translations:", translations);

              // Show results in beautiful webview
              showTranslationsPreview(translations);

              progress.report({
                message: "🎉 Translation complete!",
                increment: 40,
              });
            }
          );
        } catch (error) {
          console.error("💥 Translation error:", error);
          if (error instanceof TranslationError) {
            vscode.window.showErrorMessage(
              `Translation error: ${error.message}`
            );
          } else {
            vscode.window.showErrorMessage(
              `Unexpected error: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        }
      }
    );

    context.subscriptions.push(testCommand);
    context.subscriptions.push(disposable);

    console.log("✅ TEACHSTONE EXTENSION ACTIVATED SUCCESSFULLY");
  } catch (error) {
    console.error("💥 TEACHSTONE EXTENSION ACTIVATION ERROR", error);
    vscode.window.showErrorMessage(`Extension activation failed: ${error}`);
  }
}

function showTranslationsPreview(translations: { es: string; fr: string }) {
  const panel = vscode.window.createWebviewPanel(
    "translationsPreview",
    "🌍 Teachstone Translations",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teachstone Translations</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            :root {
                /* Teachstone Brand Colors */
                --teachstone-orange: #f26822;
                --teachstone-orange-light: #ff7a3a;
                --teachstone-orange-dark: #d45a1e;
                --teachstone-blue: #0066cc;
                --teachstone-blue-light: #3380d4;
                --teachstone-blue-dark: #004d99;
                --teachstone-green: #2d5a2d;
                --teachstone-green-light: #4a7c4a;
                --teachstone-navy: #1e3a5f;
                --teachstone-teal: #4b9b9b;
                
                /* Professional UI Colors */
                --primary: var(--teachstone-blue);
                --primary-hover: var(--teachstone-blue-dark);
                --secondary: var(--teachstone-teal);
                --accent: var(--teachstone-navy);
                --success: #2d8659;
                --success-hover: #236b47;
                --warning: #e67e22;
                --error: #e74c3c;
                
                /* Professional Backgrounds */
                --bg-primary: #ffffff;
                --bg-secondary: #f8f9fa;
                --bg-accent: #f1f3f5;
                --bg-card: #ffffff;
                --text-primary: var(--teachstone-navy);
                --text-secondary: #495057;
                --text-muted: #6c757d;
                --border: #dee2e6;
                --border-hover: #adb5bd;
                
                /* Educational Shadows */
                --shadow-xs: 0 1px 2px 0 rgba(30, 58, 95, 0.05);
                --shadow-sm: 0 1px 3px 0 rgba(30, 58, 95, 0.1), 0 1px 2px -1px rgba(30, 58, 95, 0.1);
                --shadow-md: 0 4px 6px -1px rgba(30, 58, 95, 0.1), 0 2px 4px -2px rgba(30, 58, 95, 0.1);
                --shadow-lg: 0 10px 15px -3px rgba(30, 58, 95, 0.1), 0 4px 6px -4px rgba(30, 58, 95, 0.1);
                --shadow-xl: 0 20px 25px -5px rgba(30, 58, 95, 0.1), 0 8px 10px -6px rgba(30, 58, 95, 0.1);
                
                --radius-sm: 6px;
                --radius: 8px;
                --radius-md: 12px;
                --radius-lg: 16px;
                --radius-xl: 24px;
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @media (prefers-color-scheme: dark) {
                :root {
                    --bg-primary: #1a1d23;
                    --bg-secondary: #2d3748;
                    --bg-accent: #4a5568;
                    --bg-card: #2d3748;
                    --text-primary: #f7fafc;
                    --text-secondary: #e2e8f0;
                    --text-muted: #a0aec0;
                    --border: #4a5568;
                    --border-hover: #718096;
                }
            }
            
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                background: linear-gradient(135deg, var(--teachstone-blue) 0%, var(--teachstone-teal) 100%);
                min-height: 100vh;
                padding: 2rem;
                color: var(--text-primary);
                font-size: 14px;
                line-height: 1.6;
                overflow-x: hidden;
            }
            
            .container {
                max-width: 1600px;
                margin: 0 auto;
                animation: fadeIn 0.8s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .header {
                text-align: center;
                margin-bottom: 3rem;
                color: white;
                position: relative;
                padding: 2rem 0;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
                animation: breathe 8s ease-in-out infinite;
                pointer-events: none;
                border-radius: 50%;
            }
            
            @keyframes breathe {
                0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.1; }
                50% { transform: scale(1.1) rotate(5deg); opacity: 0.15; }
            }
            
            .header h1 {
                font-size: clamp(2.5rem, 6vw, 4rem);
                font-weight: 800;
                margin-bottom: 1rem;
                text-shadow: 0 4px 12px rgba(0,0,0,0.3);
                letter-spacing: -0.02em;
                position: relative;
                z-index: 1;
            }
            
            .header .subtitle {
                font-size: clamp(1.125rem, 3vw, 1.5rem);
                opacity: 0.95;
                font-weight: 500;
                margin-bottom: 0.75rem;
                position: relative;
                z-index: 1;
            }
            
            .header .description {
                font-size: clamp(1rem, 2.5vw, 1.125rem);
                opacity: 0.85;
                font-weight: 400;
                max-width: 700px;
                margin: 0 auto;
                position: relative;
                z-index: 1;
            }
            
            .teachstone-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: var(--radius-xl);
                padding: 0.75rem 1.5rem;
                margin: 1.5rem auto 0;
                font-weight: 600;
                color: white;
                font-size: 0.95rem;
            }
            
            .stats-bar {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin: 2.5rem 0;
                flex-wrap: wrap;
            }
            
            .stat-item {
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.25);
                border-radius: var(--radius-lg);
                padding: 1.25rem 2rem;
                text-align: center;
                color: white;
                transition: var(--transition);
                min-width: 140px;
            }
            
            .stat-item:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0,0,0,0.15);
            }
            
            .stat-number {
                font-size: 2rem;
                font-weight: 800;
                display: block;
                margin-bottom: 0.25rem;
            }
            
            .stat-label {
                font-size: 0.875rem;
                opacity: 0.9;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .translations-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));
                gap: 2.5rem;
                margin-top: 2rem;
            }
            
            @media (max-width: 1400px) {
                .translations-grid {
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
            }
            
            @media (max-width: 768px) {
                body { padding: 1.5rem; }
                .translations-grid { gap: 1.5rem; }
                .header { margin-bottom: 2.5rem; padding: 1.5rem 0; }
                .stats-bar { gap: 1.5rem; margin: 2rem 0; }
            }
            
            .translation-card { 
                background: var(--bg-card);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-xl);
                overflow: hidden;
                transition: var(--transition);
                border: 1px solid var(--border);
                position: relative;
                animation: slideUp 0.8s ease-out forwards;
                opacity: 0;
            }
            
            .translation-card:nth-child(1) { animation-delay: 0.2s; }
            .translation-card:nth-child(2) { animation-delay: 0.4s; }
            
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(40px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            
            .translation-card:hover {
                transform: translateY(-8px);
                box-shadow: 0 25px 50px -12px rgba(30, 58, 95, 0.25);
                border-color: var(--border-hover);
            }
            
            .card-header {
                background: linear-gradient(135deg, var(--teachstone-blue), var(--teachstone-blue-dark));
                color: white;
                padding: 2rem 2.5rem;
                position: relative;
                overflow: hidden;
            }
            
            .card-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
                transform: translateX(-100%);
                transition: transform 0.8s;
            }
            
            .translation-card:hover .card-header::before {
                transform: translateX(100%);
            }
            
            .card-header h2 {
                font-size: 1.625rem;
                font-weight: 700;
                margin: 0;
                position: relative;
                z-index: 2;
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .flag {
                font-size: 2rem;
                filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
                animation: pulse 3s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
            }
            
            .card-body {
                padding: 2.5rem;
                background: var(--bg-card);
            }
            
            .action-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 2rem;
                flex-wrap: wrap;
                gap: 1.25rem;
            }
            
            .copy-button { 
                background: linear-gradient(135deg, var(--success), var(--success-hover));
                color: white;
                border: none;
                border-radius: var(--radius-xl);
                padding: 1rem 2rem;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                box-shadow: var(--shadow-sm);
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                min-width: 180px;
                justify-content: center;
                position: relative;
                overflow: hidden;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .copy-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
                transform: translateX(-100%);
                transition: transform 0.8s;
            }
            
            .copy-button:hover::before {
                transform: translateX(100%);
            }
            
            .copy-button:hover {
                transform: translateY(-3px);
                box-shadow: var(--shadow-lg);
                background: linear-gradient(135deg, var(--success-hover), var(--success));
            }
            
            .copy-button:active {
                transform: translateY(-1px);
            }
            
            .copy-button:focus {
                outline: 3px solid rgba(45, 134, 89, 0.4);
                outline-offset: 2px;
            }
            
            .copy-icon {
                width: 20px;
                height: 20px;
                transition: var(--transition);
            }
            
            .copy-button:hover .copy-icon {
                transform: scale(1.15);
            }
            
            .status-indicator {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1.25rem;
                border-radius: var(--radius-md);
                font-size: 0.85rem;
                font-weight: 600;
                background: var(--bg-accent);
                color: var(--text-secondary);
                border: 1px solid var(--border);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-success {
                background: rgba(45, 134, 89, 0.1);
                color: var(--success);
                border-color: rgba(45, 134, 89, 0.3);
            }
            
            .pre-container {
                position: relative;
                border-radius: var(--radius-lg);
                overflow: hidden;
                border: 1px solid var(--border);
                background: var(--bg-secondary);
                box-shadow: var(--shadow-sm);
            }
            
            .pre-header {
                background: var(--teachstone-navy);
                color: white;
                padding: 1rem 1.5rem;
                border-bottom: 1px solid var(--border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.85rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            pre { 
                background: var(--bg-secondary);
                border: none;
                border-radius: 0;
                padding: 2rem;
                overflow-x: auto;
                font-size: 13px;
                line-height: 1.7;
                margin: 0;
                white-space: pre-wrap;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                max-height: 600px;
                overflow-y: auto;
                color: var(--text-primary);
                scrollbar-width: thin;
                scrollbar-color: var(--border) transparent;
            }
            
            pre::-webkit-scrollbar {
                width: 10px;
                height: 10px;
            }
            
            pre::-webkit-scrollbar-track {
                background: transparent;
            }
            
            pre::-webkit-scrollbar-thumb {
                background: var(--border);
                border-radius: 6px;
            }
            
            pre::-webkit-scrollbar-thumb:hover {
                background: var(--border-hover);
            }
            
            .empty-state {
                text-align: center;
                color: var(--text-muted);
                font-style: italic;
                padding: 4rem 2rem;
                background: var(--bg-accent);
                border-radius: var(--radius-md);
                margin-top: 1rem;
                border: 2px dashed var(--border);
            }
            
            .empty-state::before {
                content: '📚';
                display: block;
                font-size: 4rem;
                margin-bottom: 1.5rem;
                opacity: 0.6;
            }
            
            .accessibility-info {
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            }
            
            @media (prefers-reduced-motion: reduce) {
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            .card-header.spanish {
                background: linear-gradient(135deg, var(--teachstone-teal), var(--teachstone-navy));
            }
            
            .card-header.french {
                background: linear-gradient(135deg, var(--teachstone-blue), var(--teachstone-blue-dark));
            }
            
            .powered-by {
                text-align: center;
                margin-top: 3rem;
                color: rgba(255, 255, 255, 0.8);
                font-size: 0.875rem;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌍 Teachstone Translations</h1>
                <p class="subtitle">Professional Multilingual Content Generation</p>
                <p class="description">Advanced translation system with template literal preservation and intelligent formatting for educational content</p>
                
                <div class="teachstone-badge">
                    <span>🎓</span>
                    Powered by CLASS® Methodology
                </div>
                
                <div class="stats-bar">
                    <div class="stat-item">
                        <span class="stat-number">2</span>
                        <span class="stat-label">Languages</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${
                          translations.es
                            ? translations.es.split("\n").length
                            : 0
                        }</span>
                        <span class="stat-label">Lines Translated</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">✨</span>
                        <span class="stat-label">Template Safe</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">🏫</span>
                        <span class="stat-label">Educational Focus</span>
                    </div>
                </div>
            </div>
            
            <div class="translations-grid">
                <div class="translation-card">
                    <div class="card-header spanish">
                        <h2>
                            <span class="flag" role="img" aria-label="Spain">🇪🇸</span>
                            Spanish Translation
                        </h2>
                    </div>
                    <div class="card-body">
                        <div class="action-bar">
                            <button class="copy-button" onclick="copyToClipboard('es')" aria-describedby="es-status">
                                <svg class="copy-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8 5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v3h2a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h2V5z"/>
                                </svg>
                                Copy Spanish
                            </button>
                            <div class="status-indicator status-success" id="es-status">
                                ✅ Ready to copy
                            </div>
                        </div>
                        
                        <div class="pre-container">
                            <div class="pre-header">
                                <span>YAML Output - Spanish (es)</span>
                                <span>📋 Educational Content</span>
                            </div>
                            ${
                              translations.es
                                ? `<pre id="es-translation" role="textbox" aria-label="Spanish translation output">${translations.es}</pre>`
                                : '<div class="empty-state">No Spanish translation available</div>'
                            }
                        </div>
                    </div>
                </div>
                
                <div class="translation-card">
                    <div class="card-header french">
                        <h2>
                            <span class="flag" role="img" aria-label="France">🇫🇷</span>
                            French Translation
                        </h2>
                    </div>
                    <div class="card-body">
                        <div class="action-bar">
                            <button class="copy-button" onclick="copyToClipboard('fr')" aria-describedby="fr-status">
                                <svg class="copy-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8 5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v3h2a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h2V5z"/>
                                </svg>
                                Copy French
                            </button>
                            <div class="status-indicator status-success" id="fr-status">
                                ✅ Ready to copy
                            </div>
                        </div>
                        
                        <div class="pre-container">
                            <div class="pre-header">
                                <span>YAML Output - French (fr)</span>
                                <span>📚 Contenu Éducatif</span>
                            </div>
                            ${
                              translations.fr
                                ? `<pre id="fr-translation" role="textbox" aria-label="French translation output">${translations.fr}</pre>`
                                : '<div class="empty-state">No French translation available</div>'
                            }
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="powered-by">
                Powered by Teachstone® Educational Excellence
            </div>
        </div>
        
        <div class="accessibility-info" aria-live="polite" id="announcements"></div>
        
        <script>
            const vscode = acquireVsCodeApi();
            
            async function copyToClipboard(lang) {
                const element = document.getElementById(lang + '-translation');
                const statusElement = document.getElementById(lang + '-status');
                const announcements = document.getElementById('announcements');
                
                if (!element) {
                    console.error('Translation element not found');
                    return;
                }
                
                try {
                    const text = element.textContent;
                    await navigator.clipboard.writeText(text);
                    
                    // Update status
                    statusElement.className = 'status-indicator status-success';
                    statusElement.innerHTML = '✅ Copied successfully!';
                    
                    // Accessibility announcement
                    announcements.textContent = lang.toUpperCase() + ' translation copied to clipboard';
                    
                    // Reset after delay
                    setTimeout(() => {
                        statusElement.innerHTML = '✅ Ready to copy';
                    }, 3000);
                    
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    statusElement.className = 'status-indicator';
                    statusElement.innerHTML = '❌ Copy failed';
                    announcements.textContent = 'Failed to copy ' + lang.toUpperCase() + ' translation';
                    
                    setTimeout(() => {
                        statusElement.className = 'status-indicator status-success';
                        statusElement.innerHTML = '✅ Ready to copy';
                    }, 3000);
                }
            }
            
            // Keyboard navigation support
            document.addEventListener('keydown', function(e) {
                if (e.key === 'c' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
                    if (e.altKey) {
                        copyToClipboard('fr');
                    } else {
                        copyToClipboard('es');
                    }
                    e.preventDefault();
                }
            });
            
            // Initialize
            console.log('🎉 Teachstone Translations UI loaded successfully');
        </script>
    </body>
    </html>`;
}

export function deactivate() {
  console.log("=== TEACHSTONE EXTENSION DEACTIVATED ===");
}
