import React from 'react';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ children, ...props }) => (
  <form {...props} className={"space-y-4 " + (props.className || '')}>
    {children}
  </form>
);