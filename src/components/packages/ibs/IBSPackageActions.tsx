import React from 'react';
import { Button } from '@/components/ui/button';
import { IBSPackageActions } from '../shared/types';

interface IBSPackageActionsProps {
    color: string;
    actions: IBSPackageActions;
    isMatured?: boolean;
}

export function IBSPackageActionsComponent({ color, actions, isMatured = false }: IBSPackageActionsProps) {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
                <Button
                    className="flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    onClick={actions.onViewProjections}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    View Projections
                </Button>
                <Button
                    className="flex items-center justify-center"
                    variant={isMatured ? "default" : "outline"}
                    onClick={isMatured ? actions.onWithdraw : actions.onEarlyWithdraw}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {isMatured ? 'Withdraw' : 'Early Withdraw'}
                </Button>
            </div>

            {!isMatured && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-yellow-600 mr-2 mt-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <p className="text-sm font-medium text-yellow-800">
                                Early Withdrawal Notice
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                                Early withdrawal may result in penalties and reduced interest earnings.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Button
                className="w-full mt-3 flex items-center justify-center"
                variant="destructive"
                onClick={actions.onClosePackage}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                    />
                </svg>
                Close Package
            </Button>
        </div>
    );
} 