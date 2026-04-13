"use client"

import { motion } from "framer-motion"
import { MoreHorizontal, Edit2, Trash2, Eye } from "lucide-react"
import { useState } from "react"

interface Column {
  key: string
  label: string
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
  title?: string
  onEdit?: (row: Record<string, unknown>) => void
  onDelete?: (row: Record<string, unknown>) => void
  onView?: (row: Record<string, unknown>) => void
}

export function DataTable({ columns, data, title, onEdit, onDelete, onView }: DataTableProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
    >
      {title && (
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-[#0a1628]">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className="hover:bg-slate-50 transition-colors group"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-slate-700">
                    {col.render 
                      ? col.render(row[col.key], row)
                      : String(row[col.key])
                    }
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <div className="relative flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveMenu(activeMenu === rowIndex ? null : rowIndex)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </motion.button>

                    {activeMenu === rowIndex && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-1 w-36 bg-[#0f2035] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
                      >
                        {onView && (
                          <button
                            onClick={() => { onView(row); setActiveMenu(null); }}
                            className="w-full px-4 py-2 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => { onEdit(row); setActiveMenu(null); }}
                            className="w-full px-4 py-2 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => { onDelete(row); setActiveMenu(null); }}
                            className="w-full px-4 py-2 flex items-center gap-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        )}
                      </motion.div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
