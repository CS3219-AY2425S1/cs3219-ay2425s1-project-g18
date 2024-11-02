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

interface HistoryTableProps {
  matches: any[]
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
            <TableHead>Partner</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map((match: any, index: number) => (
            <TableRow key={index} className="h-20 hover:bg-transparent">
              <TableCell>Question</TableCell>
              <TableCell>Partner</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  )
}

export default HistoryTable