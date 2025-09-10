import React, { useMemo } from 'react';
import { Table, Form, Button, Badge, Row, Col } from 'react-bootstrap';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string;
  className?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  pagination?: boolean;
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];
  onRowClick?: (item: T, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onSearch?: (term: string) => void;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  responsive?: boolean;
  size?: 'sm' | 'lg';
  actions?: (item: T, index: number) => React.ReactNode;
  headerActions?: React.ReactNode;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  sortable = true,
  pagination = true,
  itemsPerPage = 10,
  itemsPerPageOptions = [5, 10, 25, 50],
  onRowClick,
  onSort,
  onSearch,
  emptyMessage = 'No data found',
  className = '',
  striped = true,
  bordered = true,
  hover = true,
  responsive = true,
  size,
  actions,
  headerActions
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<string>('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Filter by search term
    if (debouncedSearchTerm) {
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        })
      );
    }

    // Sort data
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle different data types
        if (aValue instanceof Date && bValue instanceof Date) {
          aValue = aValue.getTime();
          bValue = bValue.getTime();
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, debouncedSearchTerm, sortBy, sortOrder, columns]);

  // Pagination
  const {
    currentPage,
    totalPages,
    itemsPerPage: currentItemsPerPage,
    paginatedItems: currentData,
    goToPage,
    setItemsPerPage,
    paginationInfo
  } = usePagination(filteredAndSortedData, {
    totalItems: filteredAndSortedData.length,
    itemsPerPage
  });

  const handleSort = (key: string) => {
    if (!sortable) return;

    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(key);
    setSortOrder(newOrder);
    onSort?.(key, newOrder);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onSearch?.(term);
  };

  const renderCell = (column: Column<T>, item: T, index: number) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item, index);
    }

    // Default rendering
    if (value === null || value === undefined) {
      return <span className="text-muted">N/A</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <Badge bg={value ? 'success' : 'danger'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    return String(value);
  };

  if (loading) {
    return <LoadingSpinner text="Loading data..." centered />;
  }

  return (
    <div className={className}>
      {/* Search and Controls */}
      {(searchable || headerActions) && (
        <Row className="mb-3">
          {searchable && (
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </Col>
          )}
          {sortable && (
            <>
              <Col md={2}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Sort by...</option>
                  {columns
                    .filter(col => col.sortable !== false)
                    .map(col => (
                      <option key={col.key} value={col.key}>
                        {col.label}
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  disabled={!sortBy}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </Form.Select>
              </Col>
            </>
          )}
          {pagination && (
            <Col md={2}>
              <Form.Select
                value={currentItemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>
                    {option} per page
                  </option>
                ))}
              </Form.Select>
            </Col>
          )}
          {headerActions && (
            <Col md={pagination ? 2 : 4}>
              {headerActions}
            </Col>
          )}
        </Row>
      )}

      {/* Table */}
      {filteredAndSortedData.length > 0 ? (
        <>
          <Table
            striped={striped}
            bordered={bordered}
            hover={hover}
            responsive={responsive}
            size={size}
          >
            <thead>
              <tr>
                {columns.map(column => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={`${column.className || ''} ${sortable && column.sortable !== false ? 'cursor-pointer' : ''}`}
                    onClick={() => handleSort(column.key)}
                  >
                    {column.label}
                    {sortable && column.sortable !== false && sortBy === column.key && (
                      <span className="ms-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                ))}
                {actions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr
                  key={item.id || item.$id || index}
                  onClick={() => onRowClick?.(item, index)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {columns.map(column => (
                    <td key={column.key} className={column.className}>
                      {renderCell(column, item, index)}
                    </td>
                  ))}
                  {actions && (
                    <td onClick={(e) => e.stopPropagation()}>
                      {actions(item, index)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination Info */}
          <Row className="mb-2">
            <Col>
              <small className="text-muted">
                Showing {paginationInfo.startIndex + 1} to {paginationInfo.endIndex} of {filteredAndSortedData.length} results
              </small>
            </Col>
          </Row>

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              className="mt-3"
            />
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;
