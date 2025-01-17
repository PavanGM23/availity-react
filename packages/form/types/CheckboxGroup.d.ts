import * as React from 'react';
import { FormGroupProps } from 'reactstrap';

interface CheckboxGroupProps extends FormGroupProps {
  name: string;
  label?: React.ReactNode;
  labelClassName?: string;
  groupClassName?: string;
  onChange?: (value: any) => void;
  helpId?: string;
  required?: boolean | false;
}

declare class CheckboxGroup extends React.Component<CheckboxGroupProps> {}

export default CheckboxGroup;
