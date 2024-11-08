"use client"

import React, { useState, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';
import { Awareness } from "y-protocols/awareness";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom } from "@liveblocks/react/suspense";
import { Cursors } from "./Cursors";

interface CodeEditorProps {
  ydoc: Y.Doc;
  collabprovider: WebsocketProvider;
  initialCode?: string;
  language?: string;
  theme?: 'light' | 'vs-dark';
  userName: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  ydoc,
  collabprovider,
  initialCode = '',
  language = 'javascript',
  theme = 'light',
  userName,
}) => {
  const [editor, setEditor] = useState<any | null>(null)
  const [collabLanguage, setCollabLanguage] = useState<string | undefined>(language.toLowerCase())
  const [collabProvider, setCollabProvider] = useState<WebsocketProvider | null>(collabprovider);
  const [yjsProvider, setYjsProvider] = useState<LiveblocksYjsProvider>();
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const room = useRoom();

  let yProvider: LiveblocksYjsProvider | null = null;

  if (yProvider == null && room != null) {
    yProvider = new LiveblocksYjsProvider(room, ydoc);
    setYjsProvider(yProvider);
  }

  useEffect(() => {
    if (collabProvider == null || editor == null || collabLanguage == null || yjsProvider == null) {
      return
    }
    const ytext = ydoc.getText('monaco');

    const binding = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      yjsProvider.awareness as unknown as Awareness
    );
    setBinding(binding)

    const awareness = yjsProvider.awareness;

    // Set user awareness
    awareness.setLocalStateField('user', {
      name: userName,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    });

    return () => {
      ydoc.destroy();
      binding.destroy();
      collabProvider.destroy();
    }
  }, [ydoc, collabProvider, editor, room, collabLanguage])

  const handleEditorDidMount: OnMount = (editor) => {
    setEditor(editor);
    const ytext = ydoc.getText('monaco');
    console.log('ytext length:', ytext.length);
    console.log('initialCode:', initialCode);
    // Initialize the shared text with initialCode
    if (ytext.length === 0 && initialCode) {
      ytext.insert(0, initialCode);
    }
    editor.setValue(ytext.toString());
  };

  return (
    <div className='h-full rounded-xl overflow-hidden pt-1 bg-purple-300'>
      {yjsProvider ? <Cursors yProvider={yjsProvider} /> : null}
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