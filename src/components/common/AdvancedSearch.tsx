import React, { useState, useMemo } from 'react';
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  value: string | number;
  value2?: string | number; // For 'between' operator
}

export interface AdvancedSearchProps {
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    options?: Array<{ value: string; label: string }>;
  }>;
  onSearch: (filters: SearchFilter[]) => void;
  onClear: () => void;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  fields,
  onSearch,
  onClear,
  className = ''
}) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const operators = [
    { value: 'equals', label: t('equals') },
    { value: 'contains', label: t('contains') },
    { value: 'startsWith', label: t('starts_with') },
    { value: 'endsWith', label: t('ends_with') },
    { value: 'greaterThan', label: t('greater_than') },
    { value: 'lessThan', label: t('less_than') },
    { value: 'between', label: t('between') }
  ];

  const addFilter = () => {
    setFilters([...filters, {
      field: fields[0]?.key || '',
      operator: 'contains',
      value: ''
    }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    const validFilters = filters.filter(filter => 
      filter.field && filter.value !== '' && filter.value !== null
    );
    onSearch(validFilters);
  };

  const handleClear = () => {
    setFilters([]);
    onClear();
  };

  const getOperatorOptions = (fieldType: string) => {
    switch (fieldType) {
      case 'number':
        return operators.filter(op => 
          ['equals', 'greaterThan', 'lessThan', 'between'].includes(op.value)
        );
      case 'date':
        return operators.filter(op => 
          ['equals', 'greaterThan', 'lessThan', 'between'].includes(op.value)
        );
      default:
        return operators.filter(op => 
          ['equals', 'contains', 'startsWith', 'endsWith'].includes(op.value)
        );
    }
  };

  const getInputType = (fieldType: string) => {
    switch (fieldType) {
      case 'number': return 'number';
      case 'date': return 'date';
      default: return 'text';
    }
  };

  const getFieldType = (fieldKey: string) => {
    return fields.find(f => f.key === fieldKey)?.type || 'text';
  };

  return (
    <Card className={className}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">{t('advanced_search')}</h6>
        <Button
          variant="link"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? t('hide') : t('show')}
        </Button>
      </Card.Header>
      
      {showAdvanced && (
        <Card.Body>
          {filters.length > 0 && (
            <div className="mb-3">
              <div className="d-flex flex-wrap gap-2">
                {filters.map((filter, index) => {
                  const field = fields.find(f => f.key === filter.field);
                  return (
                    <Badge key={index} bg="secondary" className="d-flex align-items-center">
                      {field?.label}: {filter.operator} {filter.value}
                      <Button
                        variant="link"
                        size="sm"
                        className="text-white p-0 ms-1"
                        onClick={() => removeFilter(index)}
                      >
                        ×
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {filters.map((filter, index) => (
            <Row key={index} className="mb-3">
              <Col md={3}>
                <Form.Select
                  value={filter.field}
                  onChange={(e) => updateFilter(index, { field: e.target.value })}
                >
                  {fields.map(field => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filter.operator}
                  onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                >
                  {getOperatorOptions(getFieldType(filter.field)).map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={filter.operator === 'between' ? 2 : 4}>
                {getFieldType(filter.field) === 'select' ? (
                  <Form.Select
                    value={filter.value}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                  >
                    <option value="">{t('select_option')}</option>
                    {fields.find(f => f.key === filter.field)?.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type={getInputType(getFieldType(filter.field))}
                    value={filter.value}
                    onChange={(e) => updateFilter(index, { value: e.target.value })}
                    placeholder={t('enter_value')}
                  />
                )}
              </Col>
              {filter.operator === 'between' && (
                <Col md={2}>
                  <Form.Control
                    type={getInputType(getFieldType(filter.field))}
                    value={filter.value2 || ''}
                    onChange={(e) => updateFilter(index, { value2: e.target.value })}
                    placeholder={t('to')}
                  />
                </Col>
              )}
              <Col md={1}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeFilter(index)}
                >
                  ×
                </Button>
              </Col>
            </Row>
          ))}

          <Row>
            <Col>
              <Button variant="outline-primary" size="sm" onClick={addFilter} className="me-2">
                {t('add_filter')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSearch} className="me-2">
                {t('search')}
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={handleClear}>
                {t('clear')}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      )}
    </Card>
  );
};

export default AdvancedSearch;
