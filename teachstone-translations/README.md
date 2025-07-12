# Teachstone Translations VS Code Extension

<div align="center">
  <img src="resources/logots.png" alt="Teachstone Translations Logo" width="128" height="128">
  <h1>Teachstone Translations</h1>
  <p>Automatically translate Teachstone message files to Spanish and French with intelligent formatting</p>
</div>

## Features

- 🌍 **Translate TypeScript message files** to Spanish and French using Hugging Face AI
- 🏗️ **Nested object support** - handles complex message structures with proper indentation
- ⚡ **Fast batch processing** (5 items per batch) with progress tracking
- 🎨 **Intelligent formatting** with 4-space nested indentation and alphabetical sorting
- 📝 **Smart quote handling** - only adds quotes for contractions (e.g., "Don't")
- 🔧 **Template literal preservation** - keeps `{{variable}}` placeholders unchanged
- 🐍 **camelCase to snake_case conversion** - converts keys to proper YAML format
- 📋 **One-click copy to clipboard** with beautiful preview panel
- ⌨️ **Keyboard shortcut support** (`Cmd+Shift+T` / `Ctrl+Shift+T`)

## Prerequisites

Before installing the extension, make sure you have:

1. VS Code version 1.60.0 or higher
2. A Hugging Face API key ([Get one here](https://huggingface.co/settings/tokens))

## Installation

1. Download the `.vsix` file from the latest release
2. Open VS Code
3. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
4. Type "Install from VSIX"
5. Select the downloaded `.vsix` file

## Configuration

1. Open VS Code Settings:
   - Mac: `Cmd+,`
   - Windows/Linux: `Ctrl+,`
2. Search for "Teachstone"
3. Enter your Hugging Face API key in the "TeachstoneTranslations: HuggingFaceApiKey" field

## Usage

### Method 1: Keyboard Shortcut

- Mac: `Cmd+Shift+T`
- Windows/Linux: `Ctrl+Shift+T`

### Method 2: Command Palette

1. Open Command Palette:
   - Mac: `Cmd+Shift+P`
   - Windows/Linux: `Ctrl+Shift+P`
2. Type "Teachstone Translations"
3. Press Enter

### Working with Translations

1. Open a TypeScript file containing message definitions
2. Trigger translation using either method above
3. Wait for the translation process to complete
4. Review translations in the preview panel
5. Use the copy button to copy translations to clipboard

## Message File Structure

### Basic Structure

```typescript
const PATH = "fe.pages.example";
const messages = {
  pageTitle: {
    key: `${PATH}.page_title`,
    defaultValue: "Page Title",
  },
  description: {
    key: `${PATH}.description`,
    defaultValue: "This is a description",
  },
};
```

### Nested Structure Support

```typescript
const PATH = "fe.pages.calibrations";
const messages = {
  modal: {
    instructionsTitle: {
      key: `${PATH}.instructions_title`,
      defaultValue: "Instructions",
    },
    dismissButton: {
      key: `${PATH}.dismiss_button`,
      defaultValue: "Dismiss",
    },
  },
  attempt: {
    key: `${PATH}.attempt`,
    defaultValue: "Attempt {{value}}",
  },
  errorMessage: {
    key: `${PATH}.error_message`,
    defaultValue: "Don't forget to save your work!",
  },
};
```

### Output Format

The extension produces YAML-formatted output with proper indentation:

```yaml
attempt: Intento {{value}}
error_message: "No olvides guardar tu trabajo!"
modal:
  dismiss_button: Descartar
  instructions_title: Instrucciones
```

## Features in Detail

### 🏗️ Nested Object Support

- Automatically detects nested message structures
- Maintains hierarchy with proper 4-space indentation
- Recursively processes all levels of nesting

### 🎨 Intelligent Formatting

- **Alphabetical sorting**: All keys sorted at each level
- **camelCase to snake_case**: `instructionsTitle` → `instructions_title`
- **Smart indentation**: Root level (no indent), nested items (4 spaces)
- **PATH variable substitution**: Replaces `${PATH}` with actual path

### 📝 Smart Quote Handling

- **No quotes for regular text**: `Hello world` → `Hello world`
- **Quotes for contractions**: `Don't go` → `'Don't go'`
- **Automatic detection**: Uses regex to identify contractions

### 🔧 Template Literal Preservation

- **Preserves placeholders**: `{{userName}}`, `{{value}}`, etc.
- **No translation of variables**: Content inside `{{}}` stays unchanged
- **Works with any variable name**: `{{customVariable}}`

### ⚡ Batch Processing

- Processes translations in batches of 5 items
- Shows progress indicator in notification
- Handles rate limiting automatically
- Cancellation support

### 🎯 Professional Preview Panel

- Side-by-side view of Spanish and French translations
- Copy functionality for each translation
- Beautiful Teachstone-branded UI
- Responsive design with hover effects

## Troubleshooting

### Common Issues

1. **Command Not Found**

   - Ensure the extension is properly installed
   - Try reloading VS Code (`Cmd/Ctrl+R`)
   - Check if the extension is enabled in Extensions panel

2. **Translation Fails**

   - Verify your Hugging Face API key is correct
   - Check your internet connection
   - Ensure the message file format matches the examples
   - Check VS Code Developer Console for detailed errors

3. **Nested Objects Not Recognized**

   - Verify proper TypeScript syntax with curly braces
   - Ensure `key` and `defaultValue` properties are present
   - Check for missing commas or quotes

4. **Keyboard Shortcut Conflict**
   - Check for shortcut conflicts in VS Code Keyboard Shortcuts
   - Customize the shortcut if needed: `Preferences > Keyboard Shortcuts`

### API Limitations

- Hugging Face free tier has rate limits
- Large files may take longer to process
- Network timeouts handled gracefully with retries

## Examples

### Simple Messages

**Input:**

```typescript
const messages = {
  welcome: {
    key: `${PATH}.welcome`,
    defaultValue: "Welcome to our application",
  },
};
```

**Spanish Output:**

```yaml
welcome: Bienvenido a nuestra aplicación
```

### Complex Nested Structure

**Input:**

```typescript
const messages = {
  navigation: {
    home: {
      key: `${PATH}.home`,
      defaultValue: "Home",
    },
    settings: {
      key: `${PATH}.settings`,
      defaultValue: "Settings",
    },
  },
  userProfile: {
    editButton: {
      key: `${PATH}.edit_button`,
      defaultValue: "Edit Profile",
    },
  },
};
```

**Spanish Output:**

```yaml
navigation:
  home: Inicio
  settings: Configuración
user_profile:
  edit_button: Editar Perfil
```

## Support

For issues, feature requests, or contributions, please visit our [GitHub repository](https://github.com/teachstone/vscode-translations).

## License

This extension is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by Teachstone
