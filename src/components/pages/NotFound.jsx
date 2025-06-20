import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';

function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <EmptyState
          icon="🔍"
          title="Page Not Found"
          description="The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL."
        />
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;