"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from 'next/link';


export const columns: ColumnDef<PastMatch>[] = [
    {
        accessorKey: "questionTitle",
        header: "Question",
        cell: ({ row }) => {
            const title = row.getValue('questionTitle') as string
            const matchId = row.original.matchId as string

            console.log("matchId", matchId)

            return <Link key={matchId} href={`/profile/history/${matchId}`}>{title}</Link>
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => new Date(row.getValue('createdAt') as string).toDateString(),
    },
]
