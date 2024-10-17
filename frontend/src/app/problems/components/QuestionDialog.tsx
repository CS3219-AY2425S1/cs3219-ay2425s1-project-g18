import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { stringToDifficulty } from '@/lib/utils';

const QuestionDialog = ({ question }: QuestionProps) => {
    return (
        <Dialog>
            <DialogTrigger>
                <span style={{ transition: 'color 0.3s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-category-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}>
                    {question.title}
                </span>
            </DialogTrigger>
            <DialogContent className='sm:max-w-3xl'>
                <DialogHeader>
                    <DialogTitle className='text-2xl mb-2'>
                        {question.questionId}. {question.title}
                    </DialogTitle>
                    <DialogDescription className='flex gap-2'>
                        <div>
                            <Badge variant={stringToDifficulty(question.difficulty)}>{question.difficulty}</Badge>
                        </div>
                        <Separator orientation='vertical' />
                        <div className='flex gap-2'>
                            Categories:
                            {question.categories.map((c: string) => (
                                c && <Badge variant="category" key={c}>{c}</Badge>
                            ))}
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className='flex flex-col justify-between min-h-32'>
                    <div>
                        {question.description || "This action cannot be undone. This will permanently delete your account and remove your data from our servers."}
                    </div>
                    <div>
                        {/* Insert image if needed */}
                    </div>
                    <div className='flex justify-end'>
                        <Button>Attempt</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default QuestionDialog