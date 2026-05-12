import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = (props) => (
  <input className={"px-3 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 " + (props.className || '')} {...props} />
);