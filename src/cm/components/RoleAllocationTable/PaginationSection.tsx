'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationSectionProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const PaginationSection = ({ currentPage, totalPages, onPageChange }: PaginationSectionProps) => {
  if (totalPages <= 1) return null

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage)
    }
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-200
            ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>前へ</span>
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
            .map((page, index, array) => {
              const showEllipsis = index > 0 && array[index - 1] < page - 1
              return (
                <div key={page} className="flex items-center space-x-1">
                  {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`
                      w-10 rounded-lg transition-all duration-200 font-medium
                      ${currentPage === page
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                      }
                    `}
                  >
                    {page}
                  </button>
                </div>
              )
            })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-200
            ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
            }
          `}
        >
          <span>次へ</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default PaginationSection
