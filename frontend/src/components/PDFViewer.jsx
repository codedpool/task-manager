"use client";

import { useState } from "react";

export default function PDFViewer({ url, filename, onClose }) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-medium text-foreground text-sm truncate">{filename}</h3>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download={filename}
              className="text-sm text-blue-600 hover:underline"
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-muted-foreground p-1"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}
          <iframe
            src={url}
            className="w-full h-full"
            onLoad={() => setLoading(false)}
            title={filename}
          />
        </div>
      </div>
    </div>
  );
}
