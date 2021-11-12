import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTable, useRowSelect, useSortBy } from 'react-table';
import { Util, Table as RsTable } from 'reactstrap';
import Icon from '@availity/icon';
import TableHeader from './TableHeader';
import TableHeaderRow from './TableHeaderRow';
import TableHeaderCell from './TableHeaderCell';
import IndeterminateCheckbox from './IndeterminateCheckbox';
import TableRow from './TableRow';
import TableCell from './TableCell';
import { TableContext } from './TableContext';

const Table = ({
  id,
  additionalContent: AdditionalContent,
  bodyProps,
  columns,
  cellProps,
  headerProps,
  onRowClick,
  onRowSelected,
  records,
  rowProps,
  scrollable,
  selectable,
  sortable,
  initialState,
  ...rest
}) => {
  let selectionColumn;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows: selectedRows,
    allColumns,
    toggleHideColumn,
  } = useTable(
    {
      columns,
      data: records,
      initialState: initialState || {},
    },
    useSortBy,
    useRowSelect,
    (hooks) => {
      selectionColumn = {
        id: 'selection',
        title: 'Select record(s)',
        className: 'fixed-width-selection',
        defaultCanSort: false,
        disableSortBy: true,
        disableClick: true,
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <div className="text-center">
            <IndeterminateCheckbox
              data-testid="table_header_select_all"
              aria-label="Select all records"
              {...getToggleAllRowsSelectedProps()}
            />
          </div>
        ),
        Cell: ({ row: { getToggleRowSelectedProps, index } }) => (
          <div className="text-center">
            <IndeterminateCheckbox
              data-testid={`table_header_select_row_${index}`}
              aria-label="Select record"
              {...getToggleRowSelectedProps()}
            />
          </div>
        ),
      };

      hooks.visibleColumns.push((columns) => [selectionColumn, ...columns]);
    }
  );

  useEffect(() => {
    toggleHideColumn('selection', !selectable);
  }, [selectable, toggleHideColumn]);

  useEffect(() => {
    if (onRowSelected) {
      onRowSelected(selectedRows?.map((selectedRow) => selectedRow.id));
    }
  }, [selectedRows, onRowSelected]);

  let handleRowClick;
  let handleCellClick;

  if (selectable && onRowClick) {
    handleCellClick = onRowClick;
  } else {
    handleRowClick = onRowClick;
  }

  const populateId = () => (id ? `${id}_` : '');

  return (
    <TableContext.Provider
      value={{
        AdditionalContent,
        allColumns,
        selectedRows,
        scrollable,
        sortable,
      }}
    >
      <RsTable id={id} {...getTableProps({ className: 'av-grid' })} {...rest}>
        <TableHeader id={`${populateId()}table_header`} {...headerProps}>
          {headerGroups.map((headerGroup, rowIndex) => (
            <TableHeaderRow
              id={`${populateId()}table_header_row_${rowIndex}`}
              data-testid={`${populateId()}table_header_row_${rowIndex}`}
              key={rowIndex.toString()}
              headerGroup={headerGroup}
            >
              {headerGroup.headers.map((column, cellIndex) => (
                <TableHeaderCell
                  id={`${populateId()}table_header_row_${rowIndex}_cell_${cellIndex}_${column.id}`}
                  data-testid={`${populateId()}table_header_row_${rowIndex}_cell_${cellIndex}_${column.id}`}
                  key={column.id}
                  column={column}
                >
                  {column.render('Header')}
                  {sortable && !column.disableSortBy ? (
                    <Icon
                      aria-hidden="true"
                      name={column.isSorted ? (column.isSortedDesc ? 'sort-down' : 'sort-up') : 'sort'}
                    />
                  ) : null}
                </TableHeaderCell>
              ))}
            </TableHeaderRow>
          ))}
        </TableHeader>
        <tbody {...getTableBodyProps()} {...bodyProps}>
          {rows.map((row, rowIndex) => {
            prepareRow(row);
            return (
              <TableRow
                id={`${populateId()}table_row_${rowIndex}`}
                data-testid={`${populateId()}table_row_${rowIndex}`}
                key={`${populateId()}table_row_${rowIndex.toString()}`}
                index={rowIndex}
                row={row}
                onRowClick={handleRowClick}
                onCellClick={handleCellClick}
                {...rowProps}
              >
                {row.cells.map((cell, cellIndex) => (
                  <TableCell
                    id={`${populateId()}table_row_${rowIndex}_cell_${cellIndex}`}
                    data-testid={`${populateId()}table_row_${rowIndex}_cell_${cellIndex}`}
                    key={`${populateId()}table_row_${rowIndex.toString()}_cell_${cellIndex.toString()}`}
                    cell={cell}
                    onCellClick={handleCellClick}
                    {...cellProps}
                  >
                    {cell.render('Cell')}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </tbody>
      </RsTable>
    </TableContext.Provider>
  );
};

Table.propTypes = {
  id: PropTypes.string,
  additionalContent: Util.tagPropType,
  bodyProps: PropTypes.object,
  cellProps: PropTypes.object,
  columns: PropTypes.arrayOf(PropTypes.object),
  getToggleAllRowsSelectedProps: PropTypes.func,
  headerProps: PropTypes.object,
  initialState: PropTypes.object,
  onRowClick: PropTypes.func,
  onRowSelected: PropTypes.func,
  selectable: PropTypes.bool,
  sortable: PropTypes.bool,
  scrollable: PropTypes.bool,
  records: PropTypes.arrayOf(PropTypes.object),
  row: PropTypes.object,
  rowProps: PropTypes.object,
  sortBy: PropTypes.arrayOf(PropTypes.object),
};

Table.defaultProps = {
  bodyProps: {},
  cellProps: {},
  headerProps: {},
  rowProps: {},
};

export default Table;