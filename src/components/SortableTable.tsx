/* eslint-disable no-nested-ternary */
import React from 'react';
import { Table, Button } from 'react-bootstrap';

const SortableTable = ({
  data,
  columns,
  sortKey,
  sortOrder,
  onSort,
  renderRow,
}: {
  data: any[];
  columns: { key: string; label: string }[];
  sortKey: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  renderRow: (item: any) => React.ReactNode;
}) => (
  <Table striped bordered hover responsive>
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.key}>
            <Button
              variant="link"
              onClick={() => onSort(col.key)}
              className="p-0"
            >
              {col.label}
              {sortKey === col.key
                ? sortOrder === 'asc'
                  ? ' 🔼'
                  : ' 🔽'
                : ''}
            </Button>
          </th>
        ))}
      </tr>
    </thead>
    <tbody>{data.map(renderRow)}</tbody>
  </Table>
);

export default SortableTable;
