import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
    )}
    <p className="font-bold text-gray-700 text-base">{title}</p>
    {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
    {actionLabel && onAction && (
      <Button variant="outline" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
