import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@availity/icon';
import TableActionMenu from '../TableActionMenu';
import TableActionMenuItem from '../TableActionMenuItem';

const ActionCell = ({ actions, primaryAction }) => {
  const ActionCellDef = ({ row: { original }, index }) => (
    <>
      <TableActionMenu
        id={`table_row_action_menu_${original.id ? original.id : index}`}
        actions={actions}
        record={original}
      >
        {actions.map((action, index) => (
          <TableActionMenuItem
            key={action.id}
            id={`table_row_action_menu_item_${index}`}
            action={action}
            record={original}
          />
        ))}
      </TableActionMenu>
      {primaryAction && (
        <Icon name={primaryAction.iconName} title={primaryAction.title} onClick={primaryAction.onClick} />
      )}
    </>
  );

  ActionCellDef.propTypes = {
    row: PropTypes.object,
    original: PropTypes.shape({
      id: PropTypes.string,
    }),
    index: PropTypes.number,
  };
  return ActionCellDef;
};

ActionCell.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.object),
  primaryAction: PropTypes.shape({
    iconName: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
  }),
  row: PropTypes.object,
};

export default ActionCell;