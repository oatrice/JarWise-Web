import React from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import type { SyncStatus } from '../hooks/useAuthMock';

interface SyncStatusIndicatorProps {
    status: SyncStatus;
    lastBackupTime: Date | null;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ status, lastBackupTime }) => {
    const getStatusDisplay = () => {
        switch (status) {
            case 'syncing':
                return {
                    icon: <RefreshCw size={16} className="animate-spin" />,
                    text: 'Syncing...',
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-500/10',
                };
            case 'success':
                const timeAgo = lastBackupTime ? getTimeAgo(lastBackupTime) : 'Unknown';
                return {
                    icon: <Check size={16} />,
                    text: `Last backup: ${timeAgo}`,
                    color: 'text-green-400',
                    bgColor: 'bg-green-500/10',
                };
            case 'error':
                return {
                    icon: <AlertCircle size={16} />,
                    text: 'Backup failed',
                    color: 'text-red-400',
                    bgColor: 'bg-red-500/10',
                };
            case 'offline':
                return {
                    icon: <CloudOff size={16} />,
                    text: 'Waiting for connection',
                    color: 'text-yellow-400',
                    bgColor: 'bg-yellow-500/10',
                };
            default:
                return {
                    icon: <Cloud size={16} />,
                    text: 'Not synced',
                    color: 'text-gray-400',
                    bgColor: 'bg-gray-500/10',
                };
        }
    };

    const getTimeAgo = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return 'over a day ago';
    };

    const { icon, text, color, bgColor } = getStatusDisplay();

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bgColor} ${color}`}>
            {icon}
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
};

export default SyncStatusIndicator;
