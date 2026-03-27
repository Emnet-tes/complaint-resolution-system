import React from 'react';
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  header: React.ReactNode;
  // Use string for nested paths or logic-based keys
  key: string; 
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  noDataMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({ 
  data, 
  columns, 
  loading, 
  noDataMessage = "No data available",
  onRowClick 
}: TableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-50 text-[10px] uppercase font-black text-slate-400 tracking-tighter border-b border-gray-100">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-8 py-5 ${col.headerClassName || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-20 text-center">
                  <Loader2 className="animate-spin inline text-[#006B5D]" size={32} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  {noDataMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => onRowClick?.(row)}
                  className={`transition-all ${onRowClick ? 'cursor-pointer hover:bg-teal-50/40' : 'hover:bg-gray-50'}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`px-8 py-5 ${col.className || ''}`}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}