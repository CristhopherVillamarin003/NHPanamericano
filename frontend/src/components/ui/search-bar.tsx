import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className, ...props }: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className={cn('relative flex items-center w-full max-w-sm', className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 rounded-lg outline-none bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-zinc-400 text-zinc-800"
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
