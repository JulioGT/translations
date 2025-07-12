# Teachstone Translations VS Code Extension

<div align="center">
  <img src="resources/logots.png" alt="Teachstone Translations Logo" width="128" height="128">
  <h1>Teachstone Translations</h1>
  <p>Professional translation engine for Teachstone message files with real-time metrics and modern UI</p>
</div>

## ✨ Features

- 🌍 **Multi-language Translation** - English, Spanish, and French with intelligent formatting
- ⏱️ **Real-time Performance Metrics** - Track translation time, message count, and language count
- 🎨 **Modern Tailwind CSS UI** - Professional, responsive design with glass morphism effects
- 🏗️ **Nested Object Support** - Handles complex message structures with proper indentation
- ⚡ **Optimized Performance** - Fast batch processing with progress tracking
- 🔧 **Template Literal Preservation** - Keeps `{{variable}}` placeholders unchanged
- 🐍 **Smart Key Conversion** - camelCase to snake_case with alphabetical sorting
- 📋 **One-click Copy** - Beautiful preview panel with copy functionality
- ⌨️ **Keyboard Shortcut** (`Cmd+Shift+T` / `Ctrl+Shift+T`)
- 🧪 **Test Command** - Verify extension functionality

## 🚀 Performance Metrics

The extension now provides real-time insights into translation performance:

- **Total Time**: Precise measurement from command execution to completion
- **Message Count**: Number of messages processed
- **Language Count**: Total languages generated (English + Spanish + French)

## 🎨 Modern UI with Tailwind CSS

- **Glass Morphism Design**: Beautiful translucent cards with backdrop blur
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animations**: Fade-in and slide-up effects
- **Professional Branding**: Teachstone color scheme and typography
- **Interactive Elements**: Hover effects and visual feedback

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
2. Type "Teachstone: Translate Messages"
3. Press Enter

### Method 3: Test Extension

1. Open Command Palette
2. Type "Teachstone: Test Extension"
3. Verify extension is working

### Working with Translations

1. Open a TypeScript file containing message definitions
2. Trigger translation using any method above
3. Watch real-time progress and metrics
4. Review translations in the modern preview panel
5. Use copy buttons to copy translations to clipboard

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

### ⏱️ Performance Tracking

- **Real-time Metrics**: Duration, message count, and language count
- **Progress Indicators**: Visual feedback during translation process
- **Performance Optimization**: Efficient processing with minimal overhead

### 🎨 Modern UI Components

- **Metrics Dashboard**: Glass morphism cards showing performance data
- **Translation Cards**: Professional cards for each language
- **Interactive Buttons**: Hover effects and copy feedback
- **Responsive Design**: Works on all screen sizes

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

### ⚡ Optimized Processing

- Processes translations efficiently
- Shows progress indicator in notification
- Handles rate limiting automatically
- Cancellation support

### 🎯 Professional Preview Panel

- **Three-column layout**: English, Spanish, and French side-by-side
- **Copy functionality**: One-click copy for each translation
- **Modern design**: Tailwind CSS with glass morphism effects
- **Performance metrics**: Real-time statistics display

## 🏗️ Architecture & DRY Principles

The extension follows clean architecture and DRY (Don't Repeat Yourself) principles:

### Modular Design

- **Separation of Concerns**: Each module has a single responsibility
- **Reusable Components**: Shared utilities and services
- **Clean Interfaces**: Well-defined contracts between modules

### Key Modules

- **TranslationService**: Orchestrates translation workflow
- **UIGenerator**: Creates modern Tailwind-based UI
- **TemplatePreservation**: Handles template literal logic
- **MessageParser**: Parses TypeScript message files
- **ExtensionLogger**: Centralized logging system

### Code Quality

- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Performance**: Optimized for speed and efficiency
- **Maintainability**: Clean, readable, and well-documented code

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

## 🎯 Performance Benchmarks

Typical performance metrics for different file sizes:

- **Small files (1-10 messages)**: 2-5 seconds
- **Medium files (10-50 messages)**: 5-15 seconds
- **Large files (50+ messages)**: 15-30 seconds

_Performance may vary based on network conditions and API response times._

## 🤝 Contributing

This extension is built with modern web technologies and follows best practices:

- **TypeScript**: Full type safety and modern JavaScript features
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **VS Code Extension API**: Native integration with VS Code
- **Node.js**: Server-side JavaScript runtime

## 📄 License

MIT License - see LICENSE file for details.

## 🏢 About Teachstone

Teachstone is dedicated to improving educational outcomes through research-based solutions and professional development tools.
