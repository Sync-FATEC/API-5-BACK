import { AllowedTemplateVariables, TemplateVarsInput } from "./TemplateVariables";

export class TemplateParserService {
  extractTokens(html: string) {
    const matches = html.match(/\{[A-Z_]+\}/g) || [];
    return Array.from(new Set(matches.map(m => m.replace(/[{}]/g, ''))));
  }

  validateTokens(html: string) {
    const tokens = this.extractTokens(html);
    const allowed = new Set<string>(AllowedTemplateVariables as unknown as string[]);
    const unknown = tokens.filter(t => !allowed.has(t as string));
    return { tokens, unknown };
  }

  render(html: string, vars: TemplateVarsInput) {
    const { tokens, unknown } = this.validateTokens(html);
    if (unknown.length) {
      return { html: '', ok: false, error: `Variáveis desconhecidas: ${unknown.join(', ')}` };
    }
    let rendered = html;
    for (const t of tokens) {
      const value = (vars as Record<string, string>)[t] ?? '';
      rendered = rendered.replace(new RegExp(`\\{${t}\\}`, 'g'), value);
    }
    const missing = tokens.filter(t => (vars as Record<string, string>)[t] === undefined);
    return { html: rendered, ok: true, missing };
  }
}