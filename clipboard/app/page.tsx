// app/content-splitter/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Clipboard, ChevronRight, ChevronDown, Settings, Trash } from 'lucide-react';

const ContentSplitterPage = () => {
  const [content, setContent] = useState<string>('');
  const [blocks, setBlocks] = useState<string[]>([]);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>({});
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const splitContent = () => {
    const mainSectionRegex = /(?=\n?\d+\.\s)/;
    let sections = content
      .split(mainSectionRegex)
      .map(section => section.trim())
      .filter(section => section.length > 0);

    if (sections.length <= 1) {
      sections = content
        .split(/\n\s*\n+/)
        .map(section => section.trim())
        .filter(section => section.length > 0);
    }

    setBlocks(prevBlocks => [...prevBlocks, ...sections]); // Append to existing blocks
    setContent(''); // Clear input after splitting
    setExpandedBlocks({});
  };

  const clearAllSections = () => {
    setBlocks([]);
    setExpandedBlocks({});
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopyFeedback(index);
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleBlock = (index: number) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Content Splitter</h1>
          <p className="mt-2 text-sm text-gray-400">Paste your content and split it into manageable sections</p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow">
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-gray-200"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
              {blocks.length > 0 && (
                <button
                  onClick={clearAllSections}
                  className="inline-flex items-center space-x-2 text-red-500 hover:text-red-400"
                >
                  <Trash className="w-4 h-4" />
                  <span className="text-sm">Clear All</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                ref={textAreaRef}
                className="w-full h-40 p-3 text-sm sm:text-base border rounded-md font-mono resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                placeholder="Paste your content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button
                onClick={splitContent}
                className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Split Content
              </button>
            </div>

            <div className="space-y-3">
              {blocks.map((block, index) => (
                <div key={index} className="relative border rounded-lg hover:bg-gray-700 transition-colors">
                  <div
                    className="p-3 sm:p-4 cursor-pointer touch-manipulation"
                    onClick={() => copyToClipboard(block, index)}
                  >
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBlock(index);
                        }}
                        className="mt-1 p-1 hover:bg-gray-600 rounded"
                      >
                        {expandedBlocks[index] ? (
                          <ChevronDown className="w-4 h-4 text-white" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <div className="flex-grow">
                        <div
                          className={`whitespace-pre-wrap text-sm sm:text-base ${
                            expandedBlocks[index] ? '' : 'line-clamp-2'
                          }`}
                        >
                          {block}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {copyFeedback === index && (
                          <span className="text-green-400 text-sm">Copied!</span>
                        )}
                        <Clipboard className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {blocks.length > 0 && (
              <div className="text-sm text-gray-400 mt-4 text-center sm:text-left">
                Tip: Tap anywhere in a section to copy it
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContentSplitterPage;
