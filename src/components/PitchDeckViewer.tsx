
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

type PitchDeckViewerProps = {
  content: string;
};

type Slide = {
  title: string;
  body: string;
};

function parseSlides(markdown: string): Slide[] {
  // Split by "### Slide" headings
  const lines = markdown.split("\n");
  const slides: Slide[] = [];
  let currentTitle = "";
  let currentBody: string[] = [];

  function pushSlide() {
    if (!currentTitle && currentBody.length === 0) return;
    slides.push({
      title: currentTitle || "Slide",
      body: currentBody.join("\n").trim(),
    });
    currentTitle = "";
    currentBody = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith("### slide")) {
      // new slide heading
      pushSlide();
      currentTitle = trimmed.replace(/^###\s*/i, "");
    } else {
      currentBody.push(line);
    }
  }
  pushSlide();

  if (slides.length === 0) {
    return [
      {
        title: "Pitch Deck",
        body: markdown,
      },
    ];
  }

  return slides;
}

export default function PitchDeckViewer({ content }: PitchDeckViewerProps) {
  const slides = React.useMemo(() => parseSlides(content), [content]);

  return (
    <div className="space-y-4">
      {slides.map((slide, index) => (
        <div
          key={index}
          className="border border-slate-200 rounded-xl bg-white shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-900">
              {slide.title || `Slide ${index + 1}`}
            </h3>
            <span className="text-[11px] text-slate-400">
              Slide {index + 1}
            </span>
          </div>
          <div className="prose prose-sm max-w-none text-slate-800">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h4 className="text-base font-semibold mb-1">{children}</h4>
                ),
                h2: ({ children }) => (
                  <h4 className="text-base font-semibold mb-1">{children}</h4>
                ),
                h3: ({ children }) => (
                  <h5 className="text-sm font-semibold mb-1">{children}</h5>
                ),
                p: ({ children }) => (
                  <p className="text-sm leading-relaxed mb-1 last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 mb-1 text-sm">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 mb-1 text-sm">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-0.5 leading-relaxed">{children}</li>
                ),
              }}
            >
              {slide.body || "_(no content)_"}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
