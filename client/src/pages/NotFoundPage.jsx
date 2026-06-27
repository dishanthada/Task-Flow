import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 text-center flex-col gap-6"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="surface p-12 max-w-lg w-full flex flex-col items-center gap-6 animate-fade-in shadow-lg">
        {/* Glow Code */}
        <div className="relative">
          <div className="text-8xl font-black text-indigo-500/10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Oops!
          </div>
        </div>

        {/* Message */}
        <div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Page Not Found
          </h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Button */}
        <Link to="/dashboard" className="w-full sm:w-auto">
          <Button
            variant="primary"
            className="w-full sm:w-auto px-6 py-2.5 shadow-sm text-sm"
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
