import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  sortable,
} from '@patternfly/react-table';
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Title,
  Button,
  Spinner,
  Bullseye,
} from '@patternfly/react-core';
import { useDispatch } from 'react-redux';
import { PlusCircleIcon, SearchIcon } from '@patternfly/react-icons';
import {
  transformFilters,
  transformPaginationParams,
  transformSort,
} from '../Routes/ImageManager/constants';
import PropTypes from 'prop-types';

const GeneralTable = ({
  tableData,
  columnNames,
  createRows,
  emptyStateMessage,
  emptyStateActionMessage,
  emptyStateAction,
  defaultSort,
  loadTableData,
  filters,
  filterDep,
  pagination,
  clearFilters,
  actionResolver,
  areActionsDisabled,
}) => {
  const [sortBy, setSortBy] = useState(defaultSort);
  const dispatch = useDispatch();

  const columns = columnNames.map((columnName) => ({
    title: columnName.title,
    type: columnName.type,
    transforms: toShowSort ? [] : columnName.sort ? [sortable] : [],
  }));

  const { count, data, isLoading, hasError } = tableData;

  const toShowSort = isLoading || hasError || (!count?.length && hasFilters);
  useEffect(() => {
    loadTableData(dispatch, {
      ...transformFilters(filters),
      ...transformPaginationParams(pagination),
      ...transformSort({
        direction: sortBy.direction,
        name: columns[sortBy.index].type,
      }),
    });
  }, [
    pagination.perPage,
    pagination.page,
    sortBy.index,
    sortBy.direction,
    ...filterDep,
  ]);

  const hasFilters = Object.keys(filters).some((filterKey) => filterKey);

  let rows = [
    {
      heightAuto: true,
      cells: [
        {
          props: { colSpan: 8 },
          title: (
            <Bullseye>
              <EmptyState variant="small">
                <EmptyStateIcon icon={Spinner} />
              </EmptyState>
            </Bullseye>
          ),
        },
      ],
    },
  ];

  if (isLoading === false && hasError === false) {
    if (!count?.length && !hasFilters) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <Bullseye>
                  <EmptyState variant="small">
                    <EmptyStateIcon icon={PlusCircleIcon} />
                    <Title headingLevel="h2" size="lg">
                      {emptyStateMessage}
                    </Title>
                    {emptyStateActionMessage ? (
                      <Button
                        onClick={emptyStateAction}
                        isDisabled={isLoading !== false}
                      >
                        {emptyStateActionMessage}
                      </Button>
                    ) : null}
                  </EmptyState>
                </Bullseye>
              ),
            },
          ],
        },
      ];
    }
    if (!count?.length && hasFilters) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <Bullseye>
                  <EmptyState variant="small">
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      No match found
                    </Title>
                    <EmptyStateSecondaryActions>
                      <Button onClick={clearFilters} variant="link">
                        Clear all filters
                      </Button>
                    </EmptyStateSecondaryActions>
                  </EmptyState>
                </Bullseye>
              ),
            },
          ],
        },
      ];
    }

    if (data?.length) {
      rows = createRows(data);
    }
  }

  const handleSort = (_event, index, direction) => {
    setSortBy({ index, direction });
  };

  return (
    <Table
      variant="compact"
      aria-label="Manage Images table"
      sortBy={sortBy}
      onSort={handleSort}
      actionResolver={actionResolver}
      areActionsDisabled={areActionsDisabled}
      cells={columns}
      rows={rows}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

GeneralTable.propTypes = {
  tableData: PropTypes.object.isRequired,
  columnNames: PropTypes.array.isRequired,
  createRows: PropTypes.func.isRequired,
  emptyStateMessage: PropTypes.string.isRequired,
  emptyStateActionMessage: PropTypes.string,
  emptyStateAction: PropTypes.func,
  defaultSort: PropTypes.object.isRequired,
  clearFilters: PropTypes.func.isRequired,
  filters: PropTypes.array.isRequired,
  loadTableData: PropTypes.func.isRequired,
  filterDep: PropTypes.array.isRequired,
  actionResolver: PropTypes.func.isRequired,
  areActionsDisabled: PropTypes.func.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    perPage: PropTypes.number,
  }).isRequired,
};

export default GeneralTable;
