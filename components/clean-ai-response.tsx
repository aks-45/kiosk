"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Clean and format AI response text:
 * 1. Formats code blocks with language headers and copy button
 * 2. Formats tables, lists, blockquotes, and headers cleanly
 * 3. Strips LaTeX artifacts
 */
export function CleanAIResponse({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;

  // Sanitize math artifacts
  let cleanText = text
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\rightarrow/g, "➔")
    .replace(/\\leftarrow/g, "⬅")
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\geq/g, "≥")
    .replace(/\\leq/g, "≤")
    .replace(/\$\$/g, "")
    .replace(/\$([0-9.,]+)\$/g, "₹$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\/g, "");

  // Split into code blocks vs text blocks
  const segments = cleanText.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`space-y-3.5 text-slate-800 text-xs leading-relaxed ${className}`}>
      {segments.map((seg, sIdx) => {
        if (seg.startsWith("```") && seg.endsWith("```")) {
          // Code block
          const lines = seg.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine : "code";
          const codeContent = hasLang ? lines.slice(1).join("\n") : lines.join("\n");

          return <CodeBlock key={sIdx} language={lang} code={codeContent} />;
        }

        // Regular text block
        const paragraphs = seg.split(/\n{2,}/);

        return (
          <React.Fragment key={sIdx}>
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
                return <hr key={pIdx} className="border-border my-3" />;
              }

              if (trimmed.startsWith("#")) {
                const level = trimmed.match(/^#+/)?.[0].length || 1;
                const headerText = trimmed.replace(/^#+\s*/, "");
                return (
                  <h4
                    key={pIdx}
                    className={`font-extrabold text-slate-900 tracking-tight pt-1.5 ${
                      level === 1 ? "text-sm text-primary-blue" : "text-xs text-slate-900"
                    }`}
                  >
                    {renderInlineFormatting(headerText)}
                  </h4>
                );
              }

              const lines = trimmed.split("\n");

              return (
                <div key={pIdx} className="space-y-1.5">
                  {lines.map((line, lIdx) => {
                    const lineTrimmed = line.trim();
                    if (!lineTrimmed) return null;

                    // Bullet points (- or * or •)
                    if (
                      lineTrimmed.startsWith("- ") ||
                      lineTrimmed.startsWith("* ") ||
                      lineTrimmed.startsWith("• ")
                    ) {
                      const bulletContent = lineTrimmed.replace(/^[-*•]\s*/, "");
                      return (
                        <div key={lIdx} className="flex items-start gap-2.5 ml-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-1.5 shrink-0" />
                          <span className="flex-1 text-slate-700 font-medium">
                            {renderInlineFormatting(bulletContent)}
                          </span>
                        </div>
                      );
                    }

                    // Numbered list (1. or 2.)
                    const numberedMatch = lineTrimmed.match(/^(\d+)\.\s*(.*)/);
                    if (numberedMatch) {
                      const num = numberedMatch[1];
                      const content = numberedMatch[2];
                      return (
                        <div key={lIdx} className="flex items-start gap-2.5 ml-1">
                          <span className="font-extrabold text-primary-blue font-mono text-[11px] min-w-[18px]">
                            {num}.
                          </span>
                          <span className="flex-1 text-slate-700 font-medium">
                            {renderInlineFormatting(content)}
                          </span>
                        </div>
                      );
                    }

                    // Normal text line
                    return (
                      <p key={lIdx} className="leading-relaxed text-slate-700 font-medium">
                        {renderInlineFormatting(lineTrimmed)}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 my-2.5 shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-slate-400 font-bold uppercase">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-0.5"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-[11px] font-mono overflow-x-auto leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInlineFormatting(line: string) {
  // Parse inline `code`
  const codeParts = line.split(/(`.*?`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-200 font-mono text-[11px] font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Parse **bold text**
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, j) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong key={`${i}-${j}`} className="font-extrabold text-slate-950">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}
