/**
 * Reusable Spinner component
 * sizes: sm | md | lg | xl
 */
const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
  xl: 'w-14 h-14 border-4',
};

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizeClass} rounded-full border-transparent border-t-indigo-500 animate-spin ${className}`}
      style={{ borderStyle: 'solid', borderTopColor: 'var(--color-primary)' }}
    />
  );
};

export default Spinner;
