"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco'
import CodeEditor from '@/app/codeeditor/components/CodeEditor';
import Chat from '@/app/codeeditor/components/chat';
import CodeOutput from '@/app/codeeditor/components/CodeOutput';
import Editor from '@monaco-editor/react'
import VideoCall from '@/app/codeeditor/components/VideoCall';
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CollaborativeSpaceProps } from '../models/types'
import { DUMMY_QUESTION } from '../models/dummies'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import LeaveRoomAlertDialog from './leaveRoomAlertDialog';
import { useAuth } from '@/context/authContext';
import { LogOut as LeaveRoomIcon } from 'lucide-react';

const CollaborativeSpace: React.FC<CollaborativeSpaceProps> = ({
  initialCode = '',
  language = 'javascript',
  theme = 'light',
  roomId,
  userName,
  question = DUMMY_QUESTION,
  matchId = ''
}) => {
  const router = useRouter();
  const ydoc = useMemo(() => new Y.Doc(), [])
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [output, setOutput] = useState(''); // To display output from running code
  const [errorOutput, setErrorOutput] = useState(''); // To display error output from running code
  const [greenOutputText, setGreenOutputText] = useState(false);
  const [isRunLoading, setIsRunLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isLeaveDialogDisplayed, setIsLeaveDialogDisplayed] = useState(false);
  const [leftRoom, setLeftRoom] = useState(false);
  const { toast } = useToast();
  const [displayedTestCases, setDisplayedTestCases] = useState([]);

  useEffect(() => {
    // websocket link updated 
    const wsProtocol = process.env.NEXT_PUBLIC_WEBSOCKET_PROTOCOL;
    const collabBaseUrl = process.env.NEXT_PUBLIC_CODE_COLLAB_URL?.replace(/^https?:\/\//, '');
    const collabSocketUrl = `${wsProtocol}://${collabBaseUrl}/code-collab/${roomId}`;
    const provider = new WebsocketProvider(collabSocketUrl, roomId, ydoc);
    setProvider(provider);
    +
      // Set user awareness
      provider.awareness.setLocalStateField('user', {
        name: userName,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      });

    return () => {
      provider?.destroy();
      ydoc.destroy();
    };
  }, [ydoc]);

  if (provider != null && user != null && !leftRoom) {
    provider.awareness.on('change', async () => {
      if (Array.from(provider.awareness.getStates().values()).length == 1 && Array.from(provider.awareness.getStates().values())[0].user.name == user.name) {
        console.log(Array.from(provider.awareness.getStates().values()));
        try {
          const codeCollabUrl = process.env.NEXT_PUBLIC_CODE_COLLAB_URL;
          const response = await axios.post(`${codeCollabUrl}/verify-room`, {
            roomId,
            userId: user.id,
          });
          if (response.status == 404 && !leftRoom) {
            toast({
              title: 'Hmm...',
              description: `It seems like your partner has left the collaboration room. You will be redirected back to the Explore page in 10 seconds. `,
            });
            setLeftRoom(true);
            setTimeout(() => { router.push('/explore') }, 10000);
          }
        } catch (error: any) {
          if (!leftRoom) {
            toast({
              title: 'Hmm...',
              description: `It seems like your partner has left the collaboration room. You will be redirected back to the Explore page in 10 seconds. `,
            });
            setLeftRoom(true);
            setTimeout(() => { router.push('/explore') }, 10000);
          }
        }
      }
    });
  }


  if (provider === null || ydoc === null || user == null) {
    return <div>Loading...</div>;
  }



  // Function to handle running code
  const handleRunCode = async () => {
    setIsRunLoading(true);
    try {
      const codeExecBaseUrl = process.env.NEXT_PUBLIC_CODE_EXECUTION_URL;
      const executeCodeUrl = `${codeExecBaseUrl}/execute-code`;
      const response = await axios.post(executeCodeUrl, {
        questionId: question.questionId,
        code: ydoc.getText('monaco'),
        language,
      }, {
        validateStatus: (status) => status >= 200 && status < 500,
      });

      if (response.status === 400) {
        setGreenOutputText(false);
        setDisplayedTestCases([]);
        setErrorOutput(`${response.data.error}`);
        setOutput('');
      }
      const testCasesPassed: string = response.data.testCasesPassed;
      const testCasesTotal: string = response.data.testCasesTotal;
      const testCaseResults = response.data.results;
      const testCasesToShow = testCaseResults.slice(0, 2);
      setDisplayedTestCases(testCasesToShow);

      if (testCasesPassed == testCasesTotal) {
        setGreenOutputText(true);
      } else {
        setGreenOutputText(false);
      }
      setOutput(`Test cases passed: ${testCasesPassed}/${testCasesTotal}`);
      setErrorOutput('');
      console.log(response.data)
    } catch (error) {
      console.error('Error running code:', error);
      setGreenOutputText(false);
      setDisplayedTestCases([]);
      setOutput('An error occurred while running the code.');
    } finally {
      setIsRunLoading(false);
    }
  };

  // Function to handle submitting code
  const handleSubmitCode = async () => {
    setIsSubmitLoading(true);
    try {
      const codeExecBaseUrl = process.env.NEXT_PUBLIC_CODE_EXECUTION_URL;
      const submitCodeUrl = `${codeExecBaseUrl}/submit-code`;
      const response = await axios.post(submitCodeUrl, {
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
      setDisplayedTestCases([]);
      setGreenOutputText(false);
      setOutput('An error occurred while trying to submit the code.');
    } finally {
      setIsSubmitLoading(false);
    }
  }

  // Function to handle exit room
  const handleOpenLeaveRoomDialog = () => {
    setIsLeaveDialogDisplayed(true);
  }
  const handleCloseLeaveRoomDialog = () => {
    setIsLeaveDialogDisplayed(false);
  }
  const handleLeaveRoomSuccess = () => {
    setLeftRoom(true);
    router.push('/explore');
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
              <div className="cursor-pointer mb-4">
                <LeaveRoomIcon size={25} onClick={handleOpenLeaveRoomDialog}>Leave Collaborative Space</LeaveRoomIcon>
              </div>
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
          <CodeEditor
            ydoc={ydoc}
            provider={provider}
            initialCode={initialCode}
            language={language}
            theme={theme}
          />
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
                <Chat ydoc={ydoc} provider={provider} userName={userName} />
              </TabsContent>
              <TabsContent value="run" className="h-full overflow-auto">
                <CodeOutput
                  outputText={output}
                  errorOutputText={errorOutput}
                  allPassed={greenOutputText}
                  handleRunCode={handleRunCode}
                  handleSubmitCode={handleSubmitCode}
                  testCases={displayedTestCases}
                  isRunLoading={isRunLoading}
                  isSubmitLoading={isSubmitLoading}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      {isLeaveDialogDisplayed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Do you wish to leave the room?</h2>
            <div className="cursor-pointer">
              <LeaveRoomAlertDialog roomId={roomId} onClose={handleCloseLeaveRoomDialog} handleLeaveRoomSuccess={handleLeaveRoomSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CollaborativeSpace;