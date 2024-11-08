"use client"

import React, { useEffect, useMemo, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco'
import CodeEditor from '@/app/codeeditor/components/CodeEditor';
import Chat from '@/app/codeeditor/components/chat';
import CodeOutput from '@/app/codeeditor/components/CodeOutput';
import { createClient } from '@liveblocks/client';
import { Room } from './Room';
import VideoCall from '@/app/codeeditor/components/VideoCall';
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CollaborativeSpaceProps } from '../models/types'
import { DUMMY_QUESTION } from '../models/dummies'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';

const CollaborativeSpace: React.FC<CollaborativeSpaceProps> = ({
  initialCode = '',
  language = 'javascript',
  theme = 'light',
  roomId,
  userName,
  question = DUMMY_QUESTION,
  matchId = ''
}) => {

  const ydoc = useMemo(() => new Y.Doc(), [])
  const [collabProvider, setCollabProvider] = useState<WebsocketProvider | null>(null);
  const [output, setOutput] = useState(''); // To display output from running code
  const [greenOutputText, setGreenOutputText] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const { toast } = useToast();
  const [client, setClient] = useState<any | null>(null);

  const LIVEBLOCKS_PUBLIC_KEY = "pk_prod_Rj6f0D6SbjfIpsvZUCvrMYzzWTE9nmlMIt8-rptn6LAau4aMsgyZFxNNuk25btUI";
  
  if (!client) {
    setClient(createClient({
      publicApiKey: LIVEBLOCKS_PUBLIC_KEY,
    }));
  }

  useEffect(() => {
    // websocket link updated 
    const provider = new WebsocketProvider('ws://localhost:5004', roomId, ydoc);
    setCollabProvider(provider);
    
    return () => {
      provider?.destroy();
      ydoc.destroy();
    };
  }, [ydoc]);

  if (collabProvider === null || ydoc === null) {
    return <div>Loading...</div>;
  }

    // Function to handle exit room
  
    // Function to handle running code
    const handleRunCode = async () => {
      try {
        const response = await axios.post('http://localhost:5005/execute-code', {
          questionId: question.questionId,
          code: ydoc.getText('monaco'),
          language,
        });
        const testCasesPassed:string = response.data.testCasesPassed;
        const testCasesTotal:string = response.data.testCasesTotal;
        if (testCasesPassed == testCasesTotal) {
          setGreenOutputText(true);
        } else {
          setGreenOutputText(false);
        }
        setOutput(`Test cases passed: ${testCasesPassed}/${testCasesTotal}`);
        console.log(response.data)
      } catch (error) {
        console.error('Error running code:', error);
        setGreenOutputText(false);
        setOutput('An error occurred while running the code.');
      }
    };
  
    // Function to handle submitting code
    const handleSubmitCode = async () => {
      try {
        const response = await axios.post('http://localhost:5005/submit-code', {
          questionId: question.questionId,
          matchId: matchId, 
          code: ydoc.getText('monaco'),
          language,
        });
        // Handle the response as needed
        console.log('Code submitted successfully:', response.data);           
        setGreenOutputText(true);
        setOutput('Code has been successfully submitted to the server.')
        toast({
          title: "Code submitted",
          description: "You have successfully uploaded your code",
      });
      } catch (error) {
        console.error('Error submitting code:', error);
        setGreenOutputText(false);
        setOutput('An error occurred while trying to submit the code.');
      }
    }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Row - Question and Code Editor */}
      <div className="flex flex-grow overflow-hidden">
        {/* Question Panel */}
        <div className="w-2/5 p-4 overflow-hidden">
          <div className="h-full border rounded-lg p-4 overflow-y-auto">
            {/* Question Title and Difficulty */}
            <div className="mb-4">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                Question {question.questionId}: {question.title}
              </h4>
              <div>
                <Badge variant={question.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'}>
                  {question.difficulty}
                </Badge>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {question.categories.map((c) => (
                  c && <Badge variant="category" key={c}>{c}</Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="text-gray-700">
              {question.description}
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="w-3/5 p-4 pl-0 overflow-hidden">
          <Room roomId={roomId}>
              <CodeEditor
                ydoc={ydoc}
                collabprovider={collabProvider}
                initialCode={initialCode}
                language={language}
                theme={theme}
              userName={userName}
              />
          </Room>
        </div>
      </div>

      {/* Bottom Row - Video Call and Chat/Output */}
      <div className="flex h-1/3 min-h-[250px]">
        {/* Video Call Panel */}
        <div className="flex w-2/5 px-4">
          <VideoCall userName={userName} roomId={roomId} />
        </div>

        {/* Chat/Output Panel */}
        <div className="w-3/5 px-4 pl-0">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="run">Run Code</TabsTrigger>
            </TabsList>
            <div className="flex-grow overflow-hidden mt-2">
              <TabsContent value="chat" className="h-full overflow-auto">
                <Chat ydoc={ydoc} provider={collabProvider} userName={userName} />
              </TabsContent>
              <TabsContent value="run" className="h-full overflow-auto">
                <CodeOutput
                  outputText={output}
                  allPassed={greenOutputText}
                  handleRunCode={handleRunCode}
                  handleSubmitCode={handleSubmitCode}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
export default CollaborativeSpace;