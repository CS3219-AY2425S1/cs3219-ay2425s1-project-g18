import { ColumnDef } from "@tanstack/react-table"
import QuestionDialog from "./QuestionDialog"
import { Badge } from "@/components/ui/badge"
import { Ellipsis } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CreateColumnsProps {
    isAdmin?: boolean;
    handleOpenEditCard?: (questionId: number) => void;
    handleOpenDeleteDialog?: (questionId: number) => void;
}

export const createColumns = <TData extends Question>({
    isAdmin,
    handleOpenEditCard,
    handleOpenDeleteDialog
}: CreateColumnsProps): ColumnDef<TData, any>[] => {
    const baseColumns: ColumnDef<TData, any>[] = [
        {
            accessorKey: "questionId",
            header: "Id",
        },
        {
            accessorKey: "questionTitle",
            header: "Title",
            cell: ({ row }) => (
                <QuestionDialog question={row.original} />
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const description = row.getValue("description") as string;
                return description && description.length > 80
                    ? `${description.slice(0, 80)}...`
                    : description || '';
            },
        },
        {
            accessorKey: "categories",
            header: "Categories",
            cell: ({ row }) => {
                const categories = row.getValue("categories") as string[];
                return (
                    <div className="flex flex-wrap gap-2">
                        {categories.map((c: string) => (
                            c && <Badge key={c} variant="category">{c}</Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: "difficulty",
            header: "Difficulty",
            cell: ({ row }) => {
                const difficulty = row.getValue("difficulty") as string;
                return <Badge variant={difficulty.toLowerCase() as "easy" | "medium" | "hard"}>{difficulty}</Badge>;
            }
        },
    ];

    if (isAdmin) {
        baseColumns.push({
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Ellipsis className="hover:cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        {handleOpenEditCard && (
                            <DropdownMenuItem onSelect={() => handleOpenEditCard(row.original.questionId)}>
                                Edit Question
                            </DropdownMenuItem>
                        )}
                        {handleOpenDeleteDialog && (
                            <DropdownMenuItem onSelect={() => handleOpenDeleteDialog(row.original.questionId)}>
                                Delete Question
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        });
    }

    return baseColumns;
};