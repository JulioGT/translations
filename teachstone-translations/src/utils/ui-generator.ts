export class UIGenerator {
  static generateTranslationsPreview(
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
  ): string {
    const formatDuration = (ms: number): string => {
      if (ms < 1000) return `${ms}ms`;
      return `${(ms / 1000).toFixed(1)}s`;
    };

    // Inline SVG logo (from resources/Group.svg)
    const tsLogo = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.6945 4.35544L11.1842 0.161994C10.7129 0.00278887 10.2926 0.257518 10.2576 0.72558L9.93603 5.0655L10.0379 5.07187L18.9215 5.57814C19.5743 5.61635 19.9627 6.12899 19.7749 6.71804L17.2435 14.7165L17.2212 14.7929L20.4595 14.8661C20.6823 14.8725 20.9148 14.7037 20.9848 14.4872L23.9651 5.07187C24.0639 4.76301 23.946 4.4446 23.6977 4.36181V4.35544H23.6945Z" fill="#7AA03F"/><path d="M9.26738 14.0892L9.93604 5.06233L1.63192 4.5879C1.28804 4.56879 0.988737 4.89994 0.96008 5.32342L0.00166729 18.2508C-0.0206214 18.5438 0.183161 18.8654 0.456993 18.9673L13.429 23.8135C13.8875 23.9854 14.3556 23.8389 14.467 23.4823L17.2212 14.7834L9.91057 14.6146C9.53803 14.6051 9.24828 14.3694 9.27056 14.0861L9.26738 14.0892Z" fill="#0A9CCA"/></svg>`;

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teachstone Translations</title>
        <style>
            body {
                background: #F9F9F9;
                font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                color: #2B3844;
            }
            .ts-header {
                display: flex;
                align-items: center;
                gap: 1.5rem;
                margin-bottom: 2.5rem;
                margin-top: 2rem;
            }
            .ts-header-logo {
                width: 56px;
                height: 56px;
                border-radius: 12px;
                background: #fff;
                box-shadow: 0 2px 8px 0 rgba(44,62,80,0.08);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0.5rem;
            }
            .ts-title {
                font-size: 2.2rem;
                font-weight: 800;
                color: #385E8E;
                letter-spacing: -0.5px;
                margin-bottom: 0.1rem;
            }
            .ts-subtitle {
                font-size: 1.15rem;
                color: #4A8264;
                font-weight: 500;
                margin-bottom: 0.2rem;
            }
            .ts-desc {
                font-size: 1.02rem;
                color: #555;
                opacity: 0.85;
                margin-bottom: 0.5rem;
            }
            .ts-metrics-row {
                display: flex;
                gap: 2rem;
                justify-content: center;
                margin-bottom: 2.5rem;
                flex-wrap: wrap;
            }
            .ts-metric-card {
                border-radius: 1.25rem;
                box-shadow: 0 2px 8px 0 rgba(44,62,80,0.08);
                padding: 2rem 1.5rem 1.5rem 1.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-width: 220px;
                min-height: 160px;
                background: #fff;
            }
            .ts-metric-red {
                background: #F2CED3;
                color: #AC213A;
            }
            .ts-metric-green {
                background: #E0EAD5;
                color: #4A8264;
            }
            .ts-metric-blue {
                background: #D1DAE5;
                color: #385E8E;
            }
            .ts-metric-label {
                font-size: 1.05rem;
                font-weight: 600;
                margin-top: 0.5rem;
                margin-bottom: 0.25rem;
                text-align: center;
            }
            .ts-metric-desc {
                font-size: 0.98rem;
                color: #555;
                opacity: 0.85;
                text-align: center;
                margin-top: 0.25rem;
            }
            .ts-metric-icon {
                margin-bottom: 0.5rem;
            }
            .ts-metric-value {
                font-size: 2.5rem;
                font-weight: 800;
                margin-bottom: 0.25rem;
                line-height: 1.1;
            }
            .card-hover {
                transition: box-shadow 0.2s;
            }
            .card-hover:hover {
                box-shadow: 0 6px 24px 0 rgba(44,62,80,0.13);
            }
            .copy-btn.copied {
                background: #22C55E;
                border-color: #22C55E;
                box-shadow: 0 6px 24px 0 rgba(44,62,80,0.13);
                transform: scale(1.07);
            }
            .copy-btn.copied svg {
                color: #fff;
            }
            .copy-btn.error {
                background: #EF4444;
                border-color: #EF4444;
                box-shadow: 0 6px 24px 0 rgba(44,62,80,0.13);
            }
            .copy-btn.error svg {
                color: #fff;
            }
            .copy-btn-success {
                background: #22C55E !important;
                border-color: #22C55E !important;
                color: #fff !important;
            }
            .copy-btn-error {
                background: #EF4444 !important;
                border-color: #EF4444 !important;
                color: #fff !important;
            }
            .copy-btn {
                background: #385E8E;
                color: #fff;
                border: 1.5px solid #385E8E;
                border-radius: 0.75rem;
                padding: 0.6rem 1.2rem;
                font-size: 1rem;
                font-weight: 600;
                box-shadow: 0 2px 8px 0 rgba(44,62,80,0.08);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                transition: background 0.2s, box-shadow 0.2s, border 0.2s, transform 0.2s;
                outline: none;
            }
            .copy-btn:focus, .copy-btn:hover {
                background: #2B3844;
                border-color: #2B3844;
                box-shadow: 0 6px 24px 0 rgba(44,62,80,0.13);
            }
            .copy-btn:active {
                background: #22304a;
                border-color: #22304a;
            }
            .copy-btn svg {
                width: 1.2em;
                height: 1.2em;
            }
            .translation-pre {
                background: #F4F6F8;
                color: #2B3844;
                border-radius: 0.75rem;
                padding: 1.25rem;
                font-size: 1rem;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                overflow-x: auto;
                border: 1px solid #E0E0E0;
                margin-top: 0.5rem;
                margin-bottom: 0.5rem;
                max-height: 350px;
                line-height: 1.6;
                box-shadow: 0 1px 4px 0 rgba(44,62,80,0.04);
                width: 100%;
                text-align: left;
            }
            .lang-badge {
                margin-left: 0.5rem;
                padding: 0.2rem 0.7rem;
                border-radius: 0.5rem;
                background: #fff;
                color: #385E8E;
                font-size: 0.95rem;
                font-weight: 700;
                border: 1px solid #e0e0e0;
                letter-spacing: 1px;
                display: inline-block;
            }
            .footer-heart {
                font-size: 1.1em;
                width: 1.1em;
                height: 1.1em;
                display: inline;
                vertical-align: middle;
            }
            .footer-flex {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            .ts-card {
                background: #fff;
                border-radius: 1.25rem;
                box-shadow: 0 2px 8px 0 rgba(44,62,80,0.08);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                min-height: 420px;
                border: 1px solid #e0e0e0;
                height: 100%;
            }
            .ts-card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #e0e0e0;
            }
            .ts-card-header-en {
                background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
                border-bottom: 2px solid #2196F3;
            }
            .ts-card-header-es {
                background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
                border-bottom: 2px solid #FF9800;
            }
            .ts-card-header-fr {
                background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
                border-bottom: 2px solid #9C27B0;
            }
            .ts-card-header-group {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .ts-flag {
                font-size: 1.7rem;
            }
            .ts-lang-name {
                font-size: 1.5rem;
                font-weight: bold;
                color: #333;
            }
            .ts-card-content {
                padding: 1.5rem;
                flex-grow: 1;
                display: flex;
                flex-direction: column;
            }
            .ts-output-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
                color: #555;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="max-w-5xl mx-auto px-4 py-2">
            <!-- Header -->
            <div class="ts-header">
                <div class="ts-header-logo">${tsLogo}</div>
                <div>
                    <div class="ts-title">Teachstone Translations</div>
                    <div class="ts-subtitle">Professional Translation Engine</div>
                    <div class="ts-desc">Seamlessly translate message files while preserving template literals and formatting</div>
                </div>
            </div>

            <!-- Metrics Dashboard -->
            <div class="ts-metrics-row">
                <div class="ts-metric-card ts-metric-red card-hover">
                    <div class="ts-metric-icon" aria-label="Time">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#F2CED3"/><path d="M12 8v4l2 2" stroke="#AC213A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="#AC213A" stroke-width="2"/></svg>
                    </div>
                    <div class="ts-metric-value">${formatDuration(
                      metrics.duration
                    )}</div>
                    <div class="ts-metric-label">Total Time</div>
                    <div class="ts-metric-desc">Time from start to finish</div>
                </div>
                <div class="ts-metric-card ts-metric-green card-hover">
                    <div class="ts-metric-icon" aria-label="Messages">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#E0EAD5"/><path d="M9 12l2 2 4-4" stroke="#4A8264" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="#4A8264" stroke-width="2"/></svg>
                    </div>
                    <div class="ts-metric-value">${metrics.messageCount}</div>
                    <div class="ts-metric-label">Messages</div>
                    <div class="ts-metric-desc">Total messages processed</div>
                </div>
                <div class="ts-metric-card ts-metric-blue card-hover">
                    <div class="ts-metric-icon" aria-label="Languages">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#D1DAE5"/><path d="M7 12h10M12 7v10" stroke="#385E8E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="#385E8E" stroke-width="2"/></svg>
                    </div>
                    <div class="ts-metric-value">${
                      metrics.languages.length
                    }</div>
                    <div class="ts-metric-label">Languages</div>
                    <div class="ts-metric-desc">Languages generated</div>
                </div>
            </div>

            <!-- Translation Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-top: 2rem; align-items: stretch;">
                ${this.generateLanguageCard(
                  "🇺🇸 English",
                  translations.en,
                  "en"
                )}
                ${this.generateLanguageCard(
                  "🇪🇸 Spanish",
                  translations.es,
                  "es"
                )}
                ${this.generateLanguageCard("🇫🇷 French", translations.fr, "fr")}
            </div>

            <!-- Footer -->
            <footer style="text-align: center; margin-top: 3rem; color: #666; opacity: 0.8;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <p style="font-size: 0.875rem; font-weight: 500; margin: 0;">Powered by Teachstone</p>
                </div>
                <p style="font-size: 0.75rem; opacity: 0.6; margin: 0;">Built with ❤️ for developers</p>
            </footer>
        </div>

        <script>
            ${this.generateCopyScript()}
        </script>
    </body>
    </html>`;
  }

  private static generateLanguageCard(
    title: string,
    content: string,
    langCode: string
  ): string {
    // Extract flag and language name
    const [flag, ...langParts] = title.split(" ");
    const langName = langParts.join(" ");
    return `
      <div class="ts-card">
        <div class="ts-card-header ${
          langCode === "en"
            ? "ts-card-header-en"
            : langCode === "es"
            ? "ts-card-header-es"
            : "ts-card-header-fr"
        }">
          <div class="ts-card-header-group">
            <span class="ts-flag">${flag}</span>
            <span class="ts-lang-name">${langName}</span>
            <span class="lang-badge">${langCode.toUpperCase()}</span>
          </div>
          <button 
            data-lang="${langCode}"
            class="copy-btn"
            aria-label="Copy ${langCode.toUpperCase()} translation"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke-width="2"/><rect x="3" y="3" width="13" height="13" rx="2" stroke-width="2"/></svg>
            Copy
          </button>
        </div>
        <div class="ts-card-content">
          <div class="ts-output-label">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="#E0E0E0"/><rect x="7" y="9" width="10" height="2" rx="1" fill="#B0B0B0"/><rect x="7" y="13" width="6" height="2" rx="1" fill="#B0B0B0"/></svg>
            <span>Translation Output</span>
          </div>
          <pre id="${langCode}" class="translation-pre">${this.escapeHtml(
      content
    )}</pre>
        </div>
      </div>
    `;
  }

  private static getLanguageDescription(langCode: string): string {
    const descriptions = {
      en: "Original English content with proper formatting",
      es: "Spanish translation with preserved template literals",
      fr: "French translation with preserved template literals",
    };
    return descriptions[langCode as keyof typeof descriptions] || "Translation";
  }

  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  private static generateCopyScript(): string {
    return `
      document.addEventListener('DOMContentLoaded', function() {
        var copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(function(btn) {
          btn.addEventListener('click', function(event) {
            var button = event.currentTarget;
            var langCode = button.getAttribute('data-lang');
            var element = document.getElementById(langCode);
            var text = element ? element.textContent : '';
            var originalText = button.innerHTML;
            var originalClass = button.className;
            if (!navigator.clipboard) {
              button.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:1.2em;height:1.2em;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Clipboard not available';
              button.className = originalClass + ' bg-red-600 border-red-600 text-white copy-btn-error';
              setTimeout(function() {
                button.innerHTML = originalText;
                button.className = originalClass;
              }, 2000);
              return;
            }
            navigator.clipboard.writeText(text).then(function() {
              button.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:1.2em;height:1.2em;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!';
              button.className = originalClass + ' bg-[#22C55E] border-[#22C55E] text-white copy-btn-success';
              button.style.boxShadow = '0 2px 8px 0 rgba(44,62,80,0.13)';
              button.style.transform = 'scale(1.07)';
              setTimeout(function() {
                button.innerHTML = originalText;
                button.className = originalClass;
                button.style.boxShadow = '';
                button.style.transform = '';
              }, 1500);
            }).catch(function(err) {
              button.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:1.2em;height:1.2em;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Error!';
              button.className = originalClass + ' bg-red-600 border-red-600 text-white copy-btn-error';
              button.style.boxShadow = '0 2px 8px 0 rgba(44,62,80,0.13)';
              setTimeout(function() {
                button.innerHTML = originalText;
                button.className = originalClass;
                button.style.boxShadow = '';
              }, 1500);
            });
          });
        });
      });
    `;
  }
}
