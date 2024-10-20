'use client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react";
import QuestionDialog from "./QuestionDialog"

interface QuestionTableProps {
    questions: any[]
    isAdmin: boolean
    handleOpenEditCard?: (questionId: number) => void
    handleOpenDeleteDialog?: (questionId: number) => void
}

const QuestionTable = (props: QuestionTableProps) => {
    const { questions, isAdmin, handleOpenEditCard, handleOpenDeleteDialog } = props

    return (
        <Table className="table-auto">
            <TableHeader>
                <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {questions.map((question: any, index: number) => (
                    <TableRow key={index} className="h-20">
                        <TableCell>{question.questionId}</TableCell>
                        <TableCell><QuestionDialog question={question} /></TableCell>
                        <TableCell>
                            {question.description.length > 80
                                ? `${question.description.slice(0, 80)}...`
                                : question.description}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-2">
                                {question.categories.map((c: string) => (
                                    c && <Badge variant="category" key={c}>{c}</Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell><Badge variant={question.difficulty.toLowerCase()}>{question.difficulty}</Badge></TableCell>
                        <TableCell>
                            {isAdmin &&
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Ellipsis className="hover:cursor-pointer" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        {handleOpenEditCard && (
                                            <DropdownMenuItem onSelect={() => handleOpenEditCard(question.questionId)}>
                                                Edit Question
                                            </DropdownMenuItem>
                                        )}
                                        {handleOpenDeleteDialog && (
                                            <DropdownMenuItem onSelect={() => handleOpenDeleteDialog(question.questionId)}>
                                                Delete Question
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default QuestionTable