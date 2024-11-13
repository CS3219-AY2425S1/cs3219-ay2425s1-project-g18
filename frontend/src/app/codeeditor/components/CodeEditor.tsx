"use client"
import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  ydoc: Y.Doc;
  provider: WebsocketProvider;
  initialCode?: string;
  language?: string;
  theme?: 'light' | 'vs-dark';
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  ydoc,
  provider,
  initialCode = '',
  language = 'javascript',
  theme = 'light',
}) => {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);
  const [collabLanguage, setCollabLanguage] = useState<string | undefined>(language.toLowerCase());
  const [collabProvider, setProvider] = useState<WebsocketProvider | null>(provider);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const awareness = collabProvider?.awareness;

  // Generate a random color for each user
  const userColor = React.useMemo(() => {
    const colors = [
      '#FF4136', '#FF851B', '#FFDC00', '#2ECC40', '#0074D9', 
      '#B10DC9', '#F012BE', '#01FF70', '#7FDBFF', '#FB6EAB'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  useEffect(() => {
    if (!editor || !awareness || !monacoInstance) return;

    const updateCursor = () => {
      const selection = editor.getSelection();
      const position = editor.getPosition();
      
      if (!selection || !position) return;

      awareness.setLocalStateField('cursor', {
        selection: {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn,
        },
        position: {
          lineNumber: position.lineNumber,
          column: position.column,
        },
        color: userColor,
      });
    };

    const disposable = editor.onDidChangeCursorPosition(updateCursor);
    const selectionDisposable = editor.onDidChangeCursorSelection(updateCursor);

    // Create cursor CSS styles
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);

    // Update remote cursors when awareness changes
    const handleAwarenessChange = () => {
      if (!editor || !monacoInstance) return;

      const states = Array.from(awareness.getStates().entries());
      const newDecorations = states
        .filter(([clientId]) => clientId !== awareness.clientID)
        .flatMap(([clientId, state]: [number, any]) => {
          if (!state.cursor) return [];
          
          const { position, selection, color } = state.cursor;
          
          const cursorClass = `remote-cursor-${clientId}`;
          const selectionClass = `remote-selection-${clientId}`;
          
            styleElement.textContent += `
            .${cursorClass}::after {
              content: '';
              border-left: 2px solid ${color};
              height: 100%;
              position: absolute;
              animation: blink-cursor 1s steps(1, start) infinite;
            }
            .${selectionClass} {
              background-color: ${color}33 !important;
            }
            @keyframes blink-cursor {
              0% {
              opacity: 1;
              }
              50% {
              opacity: 0;
              }
              100% {
              opacity: 1;
              }
            }
            `;

          const decorations = [];

          // Add cursor decoration
          decorations.push({
            range: new monacoInstance.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            options: {
              className: cursorClass,
              stickiness: monacoInstance.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
              hoverMessage: { value: `User ${clientId}` }
            }
          });

          // Add selection decoration if there is a selection
          if (selection && 
              !(selection.startLineNumber === selection.endLineNumber && 
                selection.startColumn === selection.endColumn)) {
            decorations.push({
              range: new monacoInstance.Range(
                selection.startLineNumber,
                selection.startColumn,
                selection.endLineNumber,
                selection.endColumn
              ),
              options: {
                className: selectionClass,
                hoverMessage: { value: `User ${clientId}'s selection` }
              }
            });
          }

          return decorations;
        });

      // Update decorations
      decorationsRef.current = editor.deltaDecorations(
        decorationsRef.current,
        newDecorations
      );
    };

    awareness.on('change', handleAwarenessChange);

    return () => {
      disposable.dispose();
      selectionDisposable.dispose();
      awareness.off('change', handleAwarenessChange);
      styleElement.remove();
    };
  }, [editor, awareness, userColor, monacoInstance]);

  useEffect(() => {
    if (collabProvider == null || editor == null || collabLanguage == null) {
      return;
    }

    const ytext = ydoc.getText('monaco');
    const binding = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      collabProvider?.awareness
    );
    
    setBinding(binding);
    
    return () => {
      binding.destroy();
    };
  }, [ydoc, collabProvider, editor, collabLanguage]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setEditor(editor);
    setMonacoInstance(monaco);
  };

  return (
    <div className="h-full rounded-xl overflow-hidden pt-1 bg-purple-300">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage={collabLanguage}
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
        }}
      />
    </div>
  );
};

export default CodeEditor;