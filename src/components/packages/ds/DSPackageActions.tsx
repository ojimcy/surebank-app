import React from 'react';
import { Button } from '@/components/ui/button';
import { DSPackageActions } from '../shared/types';

interface DSPackageActionsProps {
    color: string;
    actions: DSPackageActions;
}

export function DSPackageActionsComponent({ color, actions }: DSPackageActionsProps) {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
                <Button
                    className="flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    onClick={actions.onAddContribution}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Add Contribution
                </Button>
                <Button
                    className="flex items-center justify-center"
                    variant="outline"
                    onClick={actions.onWithdraw}
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
                    Withdraw
                </Button>
                <Button
                    className="flex items-center justify-center col-span-2"
                    variant="outline"
                    onClick={actions.onEditPackage}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M13.586 3.586a2 2 0 102.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Package
                </Button>
            </div>

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