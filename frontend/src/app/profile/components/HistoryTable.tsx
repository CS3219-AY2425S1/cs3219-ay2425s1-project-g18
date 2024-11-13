'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArchiveX } from 'lucide-react';
import Link from 'next/link';

interface HistoryTableProps {
  matches: PastMatch[]
}

const HistoryTable = (props: HistoryTableProps) => {
  const { matches } = props

  return (
    matches.length === 0 ? (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <ArchiveX size={32} className="text-gray-400" />
        <p className="text-gray-400 text-sm font-semibold">No history found</p>
      </div>
    ) : (
      <Table className="table-auto">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Question</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match: any, index: number) => (
            <TableRow key={index} className="h-20 hover:bg-transparent">
              <TableCell><Link key={match.matchId} href={`/profile/history/${match.matchId}`}>{match.questionTitle}</Link></TableCell>
              <TableCell>{new Date(match?.createdAt).toDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  )
}

export default HistoryTable
