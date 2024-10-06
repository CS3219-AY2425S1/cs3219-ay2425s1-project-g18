'use client'
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCaption,
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
import QuestionDialog from "./components/QuestionDialog"
import AddQuestionForm from "./components/addQuestionForm"
import EditQuestionForm from "./components/editQuestionForm"
import { useAuth } from "@/context/authContext"
import DeleteQuestionAlertDialog from "./components/deleteQuestionAlertDialog";

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [questionId, setQuestionId] = useState(0);
    const [isAddQuestionDisplayed, setIsAddQuestionDisplayed] = useState(false);
    const [isEditQuestionDisplayed, setIsEditQuestionDisplayed] = useState(false);
    const [isDeleteDialogDisplayed, setIsDeleteDialogDisplayed] = useState(false);
    const { isAuthenticated, user, isAdmin, refreshAuth } = useAuth();

    const handleOpenAddCard = () => {
        setIsAddQuestionDisplayed(true);
    };
  
    const handleCloseAddCard = () => {
        setIsAddQuestionDisplayed(false);
    };

    const handleOpenEditCard = (questionId:number) => {
        setQuestionId(questionId);
        setIsEditQuestionDisplayed(true);
    }

    const handleCloseEditCard = () => {
        setIsEditQuestionDisplayed(false);
    }

    const handleOpenDeleteDialog = (questionId:number) => {
        setQuestionId(questionId);
        setIsDeleteDialogDisplayed(true);
    }
    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogDisplayed(false);
    }

    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://localhost:5001/get-questions')
            if (!response.ok) {
                throw new Error('Failed to fetch questions')
            }
            const data = await response.json()
            setQuestions(data)
        } catch (err) {
            console.log("Error", err)
        }
    }

    useEffect(() => {
        fetchQuestions()
    }, [])

    return (
        <section className="flex flex-grow justify-center">
            <div className="flex-col h-full py-12 w-5/6 2xl:w-3/5">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl 2xl:text-4xl font-bold text-black text-start">
                        Coding Questions
                    </h1>
                    {isAdmin && 
                    <Button onClick={handleOpenAddCard}>{/*need to link this to open the add question form*/}Create a new question</Button>}
                </div>
                <div className="my-12">
                    {/* Search */}
                    {/* Filter */}
                </div>
                <Table className="table-auto">
                    <TableCaption>A list of coding questions</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Id</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Difficulty</TableHead>
                            {/* <TableHead>Status</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {questions.map((question: any, index: number) => (
                            <TableRow key={index} className="h-20"> {/* Increased height */}
                                <TableCell>{question.questionId}</TableCell>
                                <TableCell><QuestionDialog question={question}/></TableCell>
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
                                {/* <TableCell>
                                    {question.status && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <CompletedIcon sx={{ color: 'var(--color-completed-hover)' }} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Solved</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </TableCell> */}
                                <TableCell>
                                    {isAdmin && 
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Ellipsis className="hover:cursor-pointer"/>
                                        </DropdownMenuTrigger>
                                         <DropdownMenuContent className="w-56">
                                          <DropdownMenuItem onSelect={() => handleOpenEditCard(question.questionId)}>
                                            Edit Question
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onSelect={() => handleOpenDeleteDialog(question.questionId)}>
                                          
                                          Delete Question
                                          </DropdownMenuItem>
                                         </DropdownMenuContent>
                                    </DropdownMenu>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Popup card for the add question form */}
                    {isAddQuestionDisplayed && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Create New Question</h2>
                    <AddQuestionForm onClose={handleCloseAddCard} refetch={fetchQuestions} />    
                        </div>
                    </div>
                    )}

                {/* Popup card for the edit question form */}
                    {isEditQuestionDisplayed && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                          <h2 className="text-xl font-bold mb-4">Edit Question</h2>
                    <EditQuestionForm questionId={questionId} onClose={handleCloseEditCard} refetch={fetchQuestions} />
                        </div>
                    </div>
                    )}

                    {isDeleteDialogDisplayed && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                            <h2 className="text-xl font-bold mb-4">Delete Question</h2>
                            <DeleteQuestionAlertDialog questionId={questionId} onClose={handleCloseDeleteDialog} refetch={fetchQuestions} />
                            </div>
                        </div>)}
            </div>    
        </section>
    )
}
