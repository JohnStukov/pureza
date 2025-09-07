import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: 'sm' | 'lg';
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size,
  className = ''
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <BootstrapPagination size={size} className={`justify-content-center ${className}`}>
      {showFirstLast && currentPage > 1 && (
        <BootstrapPagination.First onClick={() => onPageChange(1)} />
      )}
      
      {showPrevNext && currentPage > 1 && (
        <BootstrapPagination.Prev onClick={() => onPageChange(currentPage - 1)} />
      )}
      
      {visiblePages[0] > 1 && (
        <>
          <BootstrapPagination.Item onClick={() => onPageChange(1)}>
            1
          </BootstrapPagination.Item>
          {visiblePages[0] > 2 && (
            <BootstrapPagination.Ellipsis />
          )}
        </>
      )}
      
      {visiblePages.map((page) => (
        <BootstrapPagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </BootstrapPagination.Item>
      ))}
      
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <BootstrapPagination.Ellipsis />
          )}
          <BootstrapPagination.Item onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </BootstrapPagination.Item>
        </>
      )}
      
      {showPrevNext && currentPage < totalPages && (
        <BootstrapPagination.Next onClick={() => onPageChange(currentPage + 1)} />
      )}
      
      {showFirstLast && currentPage < totalPages && (
        <BootstrapPagination.Last onClick={() => onPageChange(totalPages)} />
      )}
    </BootstrapPagination>
  );
};

export default Pagination;
