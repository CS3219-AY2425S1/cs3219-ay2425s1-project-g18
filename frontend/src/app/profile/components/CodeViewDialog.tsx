'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface CodeViewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    code: string;
    language: string;
    timestamp: string;
}

const CodeViewDialog: React.FC<CodeViewDialogProps> = ({
    isOpen,
    onClose,
    code,
    language,
    timestamp,
}) => {
    const getLanguageExtension = (lang: string) => {
        const languageMap: { [key: string]: any } = {
            'javascript': javascript(),
            'python': python(),
            'java': java(),
            // Add more languages as needed
        };
        return languageMap[lang.toLowerCase()] || javascript();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] pt-10">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle>Code Submission</DialogTitle>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            {new Date(timestamp).toLocaleString()}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="flex items-center gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Copy
                        </Button>
                    </div>
                </DialogHeader>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <CodeMirror
                        value={code}
                        extensions={[getLanguageExtension(language)]}
                        theme={vscodeDark}
                        editable={false}
                        basicSetup={{
                            lineNumbers: true,
                            highlightActiveLineGutter: false,
                            highlightActiveLine: false,
                            foldGutter: true,
                            dropCursor: false,
                            allowMultipleSelections: false,
                            indentOnInput: false,
                        }}
                        height="60vh"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CodeViewDialog;