import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface Column {
  key: string
  label: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onRowClick?: (item: any) => void
}

export function DataTable({ columns, data, onRowClick }: DataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow 
            key={index} 
            onClick={() => onRowClick && onRowClick(item)}
            className={onRowClick ? "cursor-pointer hover:bg-gray-100" : ""}
          >
            {columns.map((column) => (
              <TableCell key={column.key}>{item[column.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

