"use client"

import React, { useState, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';

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
  const [editor, setEditor] = useState<any | null>(null)
  const [collabLanguage, setCollabLanguage] = useState<string | undefined>(language.toLowerCase())
  const [collabProvider, setProvider] = useState<WebsocketProvider | null>(provider);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);

  const awareness = collabProvider?.awareness

  if (awareness != null) {
    awareness.on('change', () => {
      // Whenever somebody updates their awareness information,
      // we log all awareness information from all users.
      // console.log(Array.from(awareness.getStates().values())) // we remove this for now because it clogs up the logs
    })
  }

  useEffect(() => {
    if (collabProvider == null || editor == null || collabLanguage == null) {
      return
    }
    const ytext = ydoc.getText('monaco');

    const binding = new MonacoBinding(ytext, editor.getModel()!, new Set([editor]), collabProvider?.awareness)
    setBinding(binding)
    return () => {
      binding.destroy()
    }
  }, [ydoc, collabProvider, editor, collabLanguage])


  // useEffect(() => {
  //   const ytext = ydoc.getText('monaco');
  //   console.log('ytext length:', ytext.length);
  //   console.log('initialCode:', initialCode);
  //   // Initialize the shared text with initialCode
  //   if (ytext.length === 0 && initialCode) {
  //     ytext.insert(0, initialCode);
  //   }
  //   editor.setValue(ytext.toString());
  // }, [ydoc, initialCode]);

  const handleEditorDidMount: OnMount = (editor) => {
    setEditor(editor);
  };

  return (
    <div className='h-full rounded-xl overflow-hidden pt-1 bg-purple-300'>
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