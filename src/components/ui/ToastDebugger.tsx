import { useToast } from '@/lib/toast-provider';
import { Button } from './button';

export function ToastDebugger() {
  const { addToast, success, error, info } = useToast();

  const testCustomToast = () => {
    console.log('Testing custom toast...');
    addToast({
      title: 'Custom Toast',
      description: 'This is a custom toast message.',
      variant: 'success',
    });
  };

  const testSuccessToast = () => {
    console.log('Testing success toast...');
    success({
      title: 'Success Toast',
      description: 'This is a success toast message.',
    });
  };

  const testErrorToast = () => {
    console.log('Testing error toast...');
    error({
      title: 'Error Toast',
      description: 'This is an error toast message.',
    });
  };

  const testInfoToast = () => {
    console.log('Testing info toast...');
    info({
      title: 'Info Toast',
      description: 'This is an info toast message.',
    });
  };

  return (
    <div className="p-4 border rounded-md mb-4">
      <h3 className="font-medium mb-3">Toast Debugger</h3>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={testCustomToast}>
          Test Custom Toast
        </Button>
        <Button size="sm" onClick={testSuccessToast}>
          Test Success Toast
        </Button>
        <Button size="sm" onClick={testErrorToast}>
          Test Error Toast
        </Button>
        <Button size="sm" onClick={testInfoToast}>
          Test Info Toast
        </Button>
      </div>
    </div>
  );
} 