"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Clipboard,
  ChevronRight,
  ChevronDown,
  Settings,
  Trash,
  X,
} from "lucide-react";

const ContentSplitterPage = () => {
  const [content, setContent] = useState<string>("");
  const [blocks, setBlocks] = useState<string[]>([]);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>({});
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<number | null>(null);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle iOS keyboard and viewport adjustments
  useEffect(() => {
    const handleFocus = () => {
      setIsKeyboardVisible(true);
      // Add delay to ensure smooth transition after keyboard appears
      setTimeout(() => {
        if (contentRef.current && buttonRef.current) {
          // Calculate the position to scroll
          const buttonBottom = buttonRef.current.getBoundingClientRect().bottom;
          const viewportHeight = window.innerHeight;
          const scrollAmount = buttonBottom - viewportHeight + 20; // 20px buffer

          if (scrollAmount > 0) {
            window.scrollTo({
              top: window.scrollY + scrollAmount,
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    };

    const handleBlur = () => {
      setIsKeyboardVisible(false);
      // Scroll back to original position when keyboard hides
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle iOS viewport height changes
    const handleResize = () => {
      if (fullScreen) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    };

    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.addEventListener('focus', handleFocus);
      textArea.addEventListener('blur', handleBlur);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      if (textArea) {
        textArea.removeEventListener('focus', handleFocus);
        textArea.removeEventListener('blur', handleBlur);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [fullScreen]);

  // Prevent scrolling in fullscreen
  useEffect(() => {
    if (fullScreen) {
      document.body.style.overflow = "hidden";
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.removeProperty('--vh');
    }
  }, [fullScreen]);

  const splitContent = () => {
    const mainSectionRegex = /(?=\n?\d+\.\s)/;
    let sections = content
      .split(mainSectionRegex)
      .map((section) => section.trim())
      .filter((section) => section.length > 0);

    if (sections.length <= 1) {
      sections = content
        .split(/\n\s*\n+/)
        .map((section) => section.trim())
        .filter((section) => section.length > 0);
    }

    setBlocks((prevBlocks) => [...prevBlocks, ...sections]);
    setContent("");
    setExpandedBlocks({});
    setFullScreen(false);
    setIsKeyboardVisible(false);
  };

  const exitFullScreen = () => {
    setFullScreen(false);
    setIsKeyboardVisible(false);
    if (textAreaRef.current) {
      textAreaRef.current.blur();
    }
  };

  const clearAllSections = () => {
    setBlocks([]);
    setExpandedBlocks({});
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(index);
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const toggleBlock = (index: number) => {
    setExpandedBlocks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!fullScreen && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Content Splitter
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Paste your content and split it into manageable sections
            </p>
          </div>
        )}

        <div
          className={`bg-gray-800 rounded-lg shadow ${
            fullScreen ? "fixed inset-0 z-50" : ""
          }`}
          style={fullScreen ? { height: 'calc(var(--vh, 1vh) * 100)' } : {}}
        >
          <div
            className={`p-4 sm:p-6 space-y-4 ${
              fullScreen ? "h-full flex flex-col" : ""
            }`}
          >
            {fullScreen && (
              <div className="flex justify-between items-center">
                <button
                  onClick={exitFullScreen}
                  className="p-2 hover:bg-gray-700 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}

            {!fullScreen && (
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
            )}

            <div 
              ref={contentRef}
              className="space-y-2 flex-grow relative"
              style={{
                paddingBottom: isKeyboardVisible ? '80px' : '0'
              }}
            >
              <textarea
                ref={textAreaRef}
                className={`w-full p-4 text-base sm:text-lg border rounded-md font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white ${
                  fullScreen ? "flex-grow" : "h-32"
                }`}
                style={{
                  height: fullScreen ? isKeyboardVisible ? '40vh' : '70vh' : undefined
                }}
                placeholder="Paste your content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setFullScreen(true)}
              />

              {(fullScreen || content.length > 0) && (
                <button
                  ref={buttonRef}
                  onClick={splitContent}
                  className={`w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                    isKeyboardVisible ? 'sticky bottom-4' : ''
                  }`}
                  style={{
                    position: isKeyboardVisible ? 'fixed' : 'relative',
                    bottom: isKeyboardVisible ? '20px' : 'auto',
                    left: isKeyboardVisible ? '0' : 'auto',
                    width: isKeyboardVisible ? 'calc(100% - 2rem)' : '100%',
                    margin: isKeyboardVisible ? '0 1rem' : '0',
                    zIndex: isKeyboardVisible ? '100' : 'auto'
                  }}
                >
                  Split Content
                </button>
              )}
            </div>

            {!fullScreen && (
              <div className="space-y-3">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className="relative border rounded-lg hover:bg-gray-700 transition-colors"
                  >
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
                              expandedBlocks[index] ? "" : "line-clamp-2"
                            }`}
                          >
                            {block}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {copyFeedback === index && (
                            <span className="text-green-400 text-sm">
                              Copied!
                            </span>
                          )}
                          <Clipboard className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {blocks.length > 0 && !fullScreen && (
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