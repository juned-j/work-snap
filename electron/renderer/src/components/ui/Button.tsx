import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  let className = 'py-2 px-4 rounded font-bold transition-all active:scale-95';
  if (variant === 'primary') className += ' bg-indigo-600 hover:bg-indigo-500 text-white';
  if (variant === 'secondary') className += ' bg-slate-200 text-slate-800';
  if (variant === 'danger') className += ' bg-red-600/10 border border-red-600 text-red-500';
  return (
    <button className={className + (props.className ? ' ' + props.className : '')} {...props}>
      {children}
    </button>
  );
};