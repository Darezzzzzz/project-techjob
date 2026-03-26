// ========================================
// Navbar.jsx - Component แถบเมนูด้านบน
// ========================================

import React, { useState } from 'react';
import { Bell, Menu, X, User, LogOut, AlertCircle, CheckCircle, Clock, ClipboardList, Briefcase, XCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ========================================
// Navbar Component
// Props:
// - userRole: บทบาทผู้ใช้ ('admin', 'supervisor', 'technician')
// - onToggleSidebar: ฟังก์ชันเปิด/ปิด Sidebar
// - sidebarOpen: สถานะการเปิด/ปิด Sidebar
// - pendingJobsCount: จำนวนงานรอตรวจสอบ (สำหรับ Supervisor)
// - pendingAssignJobsCount: จำนวนงานรอมอบหมาย (สำหรับ Supervisor)
// - newJobsCount: จำนวนงานใหม่ (สำหรับ Technician)
// - rejectedJobsCount: จำนวนงานที่ถูกตีกลับ (สำหรับ Technician)
// - unassignedJobsCount: จำนวนงานที่ยังไม่มอบหมายแผนก (สำหรับ Admin)
// - completedJobsCount: จำนวนงานที่เสร็จสิ้น (สำหรับ Admin)
// - notifications: รายการแจ้งเตือน
// ========================================
function Navbar({ 
  userRole, 
  onToggleSidebar, 
  sidebarOpen, 
  pendingJobsCount = 0, 
  pendingAssignJobsCount = 0,
  newJobsCount = 0,
  rejectedJobsCount = 0,
  unassignedJobsCount = 0,
  completedJobsCount = 0,
  notifications = [] 
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowProfileMenu(false);
    navigate('/login', { replace: true });
  };

  // แสดงชื่อตามบทบาท
  const getRoleName = () => {
    switch(userRole) {
      case 'admin': return 'ผู้ดูแลระบบ';
      case 'supervisor': return 'หัวหน้าช่าง';
      case 'technician': return 'ช่างเทคนิค';
      default: return 'ผู้ใช้';
    }
  };

  // สร้างการแจ้งเตือนตามบทบาท
  const getNotifications = () => {
    if (notifications.length > 0) return notifications;
    
    // สร้างการแจ้งเตือนตัวอย่าง
    const defaultNotifications = [];
    
    if (userRole === 'admin') {
      // แจ้งเตือนงานที่ยังไม่มอบหมายแผนก
      if (unassignedJobsCount > 0) {
        defaultNotifications.push({
          id: 1,
          type: 'unassigned',
          icon: <Package size={18} />,
          title: 'งานรอมอบหมายแผนก',
          message: `มี ${unassignedJobsCount} งานที่สร้างแล้วแต่ยังไม่ได้มอบหมายให้แผนก`,
          time: 'เมื่อสักครู่',
          color: '#f59e0b'
        });
      }
      
      // แจ้งเตือนงานที่เสร็จสิ้นแล้ว (ข้อมูลสรุป)
      if (completedJobsCount > 0) {
        defaultNotifications.push({
          id: 2,
          type: 'completed',
          icon: <CheckCircle size={18} />,
          title: 'งานเสร็จสิ้น',
          message: `มีงานที่เสร็จสมบูรณ์แล้ว ${completedJobsCount} งาน`,
          time: 'วันนี้',
          color: '#10b981'
        });
      }
    }
    
    if (userRole === 'supervisor') {
      // แจ้งเตือนงานรอมอบหมาย
      if (pendingAssignJobsCount > 0) {
        defaultNotifications.push({
          id: 1,
          type: 'assign',
          icon: <ClipboardList size={18} />,
          title: 'งานรอมอบหมาย',
          message: `มี ${pendingAssignJobsCount} งานใหม่จาก Admin รอมอบหมายช่าง`,
          time: 'เมื่อสักครู่',
          color: '#3b82f6'
        });
      }
      
      // แจ้งเตือนงานรอตรวจสอบ
      if (pendingJobsCount > 0) {
        defaultNotifications.push({
          id: 2,
          type: 'review',
          icon: <AlertCircle size={18} />,
          title: 'งานรอตรวจสอบ',
          message: `มี ${pendingJobsCount} งานที่ช่างส่งมาแล้ว รอการตรวจสอบ`,
          time: 'เมื่อสักครู่',
          color: '#f59e0b'
        });
      }
    }
    
    if (userRole === 'technician') {
      // แจ้งเตือนงานที่ถูกตีกลับ (สำคัญที่สุด)
      if (rejectedJobsCount > 0) {
        defaultNotifications.push({
          id: 1,
          type: 'rejected',
          icon: <XCircle size={18} />,
          title: 'งานถูกตีกลับ',
          message: `มี ${rejectedJobsCount} งานที่ถูกตีกลับ ต้องแก้ไขและส่งใหม่`,
          time: 'เมื่อสักครู่',
          color: '#ef4444'
        });
      }
      
      // แจ้งเตือนงานใหม่
      if (newJobsCount > 0) {
        defaultNotifications.push({
          id: 2,
          type: 'newjob',
          icon: <Briefcase size={18} />,
          title: 'งานใหม่',
          message: `มี ${newJobsCount} งานใหม่ที่มอบหมายให้คุณ`,
          time: 'เมื่อสักครู่',
          color: '#10b981'
        });
      }
    }
    
    return defaultNotifications;
  };

  const notificationList = getNotifications();
  const notificationCount = notificationList.length;

  return (
    <div className="navbar">
      {/* ส่วนซ้ายของ Navbar */}
      <div className="navbar-left">
        {/* ปุ่มเปิด/ปิด Sidebar */}
        <button 
          onClick={onToggleSidebar} 
          className="menu-toggle-btn"
          aria-label="Toggle Sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* โลโก้ระบบ */}
        <div className="logo">Tech Job</div>
      </div>
      
      {/* ส่วนขวาของ Navbar */}
      <div className="navbar-right">
        {/* ปุ่มแจ้งเตือน - มี Badge แสดงการแจ้งเตือนใหม่ */}
        <div className="notification-container">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {/* Notification Badge - แสดงจำนวนการแจ้งเตือน */}
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>การแจ้งเตือน</h3>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {notificationCount} รายการ
                </span>
              </div>
              
              <div className="notification-list">
                {notificationList.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                    <CheckCircle size={40} style={{ margin: '0 auto 12px' }} />
                    <p style={{ margin: 0 }}>ไม่มีการแจ้งเตือน</p>
                  </div>
                ) : (
                  notificationList.map(notif => (
                    <div key={notif.id} className="notification-item">
                      <div 
                        className="notification-icon" 
                        style={{ backgroundColor: `${notif.color}20`, color: notif.color }}
                      >
                        {notif.icon}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notif.title}</div>
                        <div className="notification-message">{notif.message}</div>
                        <div className="notification-time">
                          <Clock size={12} /> {notif.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Menu - เมนูโปรไฟล์ผู้ใช้ */}
        <div className="profile-menu-container">
          {/* ปุ่มเปิด/ปิดเมนูโปรไฟล์ */}
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="profile-btn"
            aria-label="Profile Menu"
          >
            {/* รูปโปรไฟล์ */}
            <div className="profile-avatar">
              <User size={20} />
            </div>

            {/* ชื่อผู้ใช้ - แสดงตามบทบาท */}
            <span className="profile-name">
              {getRoleName()}
            </span>
          </button>
          
          {/* Dropdown Menu - เมนูดรอปดาวน์ */}
          {showProfileMenu && (
            <div className="profile-dropdown">
              {/* เมนูออกจากระบบ */}
              <button className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;