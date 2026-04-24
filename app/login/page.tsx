import { AuthForm } from '@/components/forms/auth-form';

export const metadata = { title: 'Sign In · SSP WC2026 Predictor' };

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center py-8">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
