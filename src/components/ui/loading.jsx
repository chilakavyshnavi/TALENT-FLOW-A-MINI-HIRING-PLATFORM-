import React from 'react';
import { cn } from "../../lib/utils";

const LoadingSpinner = ({ size = 'default', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  );
};

const LoadingPage = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

const LoadingSection = ({ message = "Loading...", size = 'default' }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
};

const LoadingCard = ({ className, children }) => {
  return (
    <div className={cn("border rounded-lg animate-pulse", className)}>
      <div className="p-6 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        {children}
      </div>
    </div>
  );
};

const LoadingButton = ({ children, loading, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export { LoadingSpinner, LoadingPage, LoadingSection, LoadingCard, LoadingButton };