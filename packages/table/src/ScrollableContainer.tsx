import React, { cloneElement, isValidElement } from 'react';

type Props = {
  id?: string;
  children?: React.ReactNode | React.ReactChild;
} & React.HTMLAttributes<HTMLElement>;

const ScrollableContainer = ({ id, children, ...rest }: Props): JSX.Element => (
  <div id={id} className="av-scrollable-table-wrapper" {...rest}>
    {isValidElement(children) && cloneElement(children, { scrollable: 'true' })}
  </div>
);

export default ScrollableContainer;
