import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-provider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/components/layout/AuthLayout';
import { Loader2 } from 'lucide-react';

export function VerifyEmailPage() {
    const [code, setCode] = useState('');
    const {
        verifyCode,
        resendVerificationCode,
        user,
        isVerifyLoading,
        isResendLoading,
    } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.email) {
            toast.error({ title: 'Email not found. Please log in again.' });
            navigate('/auth/login');
            return;
        }

        try {
            await verifyCode({ email: user.email, code });
            toast.success({ title: 'Email verified successfully!' });
            navigate('/dashboard');
        } catch (err) {
            console.log('Error verifying code', err);
            toast.error({ title: 'Verification Failed', description: 'Invalid or expired code. Please try again.' });
        }
    };

    const handleResend = async () => {
        if (!user?.email) {
            toast.error({ title: 'Email not found. Please log in again.' });
            navigate('/auth/login');
            return;
        }

        try {
            await resendVerificationCode(user.email);
            toast.success({ title: 'Verification code sent!' });
        } catch {
            toast.error({ title: 'Failed to resend code.' });
        }
    };

    const isLoading = isVerifyLoading || isResendLoading;

    return (
        <AuthLayout
            title="Verify Your Email"
            subtitle="Enter the verification code sent to your email address."
        >
            <form onSubmit={handleVerify} className="space-y-4">
                <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={isLoading}
                    className="text-center text-lg tracking-[0.5em]"
                />
                <Button type="submit" className="w-full" disabled={isVerifyLoading}>
                    {isVerifyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify
                </Button>
            </form>
            <div className="mt-4 text-center">
                <Button variant="link" onClick={handleResend} disabled={isResendLoading}>
                    {isResendLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        "Didn't receive a code? Resend"
                    )}
                </Button>
            </div>
        </AuthLayout>
    );
} 