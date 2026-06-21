import React, { useState, useEffect, useRef } from 'react';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  clearAllNotifications,
  deleteNotification,
} from '../../../services/notificationService';
import type { AppNotification } from '../../../services/notificationService';
import styles from './NotificationPanel.module.css';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    fetchNotifications()
      .then((data) => {
        if (cancelled) return;
        setNotifications(data);
        onUnreadCountChange(data.filter((n) => !n.is_read).length);
      })
      .catch((err) => console.error('Notification fetch error:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, onUnreadCountChange]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onUnreadCountChange(0);
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearAllNotifications();
      setNotifications([]);
      onUnreadCountChange(0);
    } catch (err) {
      console.error('Clear error:', err);
    } finally {
      setClearing(false);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.is_read) return;

    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      onUnreadCountChange(notifications.filter(n => !n.is_read && n.id !== id).length);
    } catch (err) {
      console.error('Mark single read error:', err);
    }
  };

  const handleDeleteSingle = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // prevent clicking the notification which would trigger mark as read
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter(n => n.id !== id));
      // update unread count if we deleted an unread notification
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.is_read) {
        onUnreadCountChange(notifications.filter(n => !n.is_read && n.id !== id).length);
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alert': return 'fa-solid fa-triangle-exclamation';
      case 'success': return 'fa-solid fa-circle-check';
      case 'info': return 'fa-solid fa-circle-info';
      default: return 'fa-solid fa-bell';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'alert': return '#ef4444';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel} ref={panelRef}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Notifications</h3>
          <div className={styles.panelActions}>
            {notifications.length > 0 && (
              <>
                <button className={styles.actionBtn} onClick={handleMarkAllRead} title="Mark all as read">
                  <i className="fa-solid fa-check-double"></i>
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.clearBtn}`}
                  onClick={handleClearAll}
                  disabled={clearing}
                  title="Clear all"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.panelBody}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fa-regular fa-bell-slash"></i>
              <h4>All caught up!</h4>
              <p>No notifications right now.</p>
            </div>
          ) : (
            <div className={styles.notificationList}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.notificationItem} ${!n.is_read ? styles.unread : ''}`}
                  onClick={() => handleMarkSingleRead(n.id)}
                  style={{ cursor: !n.is_read ? 'pointer' : 'default' }}
                >
                  <div className={styles.notifIcon} style={{ color: getTypeColor(n.type) }}>
                    <i className={getTypeIcon(n.type)}></i>
                  </div>
                  <div className={styles.notifContent}>
                    <span className={styles.notifTitle}>{n.title}</span>
                    <p className={styles.notifMessage}>{n.message}</p>
                    <span className={styles.notifTime}>{formatTime(n.created_at)}</span>
                  </div>
                  
                  <div className={styles.notifActions}>
                    {!n.is_read && <div className={styles.unreadDot}></div>}
                    <button 
                      className={styles.deleteSingleBtn} 
                      onClick={(e) => handleDeleteSingle(e, n.id)}
                      title="Delete notification"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
