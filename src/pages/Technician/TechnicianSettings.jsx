// src/pages/Technician/TechnicianSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
    User, Mail, Phone, Camera, Bell, Lock, 
    Eye, EyeOff, BarChart3, FileText, Info,
    LogOut, ChevronRight, Sun, Moon, Type,
    CheckCircle, AlertCircle, Clock, Briefcase
} from 'lucide-react';
import '../Dashboard/Dashboard.css';

function TechnicianSettings({ 
    currentTechnician = { 
        id: 'tech1', 
        name: 'สมชาย ใจดี',
        phone: '081-234-5678',
        email: 'somchai@example.com',
        department: 'ไฟฟ้า'
    }
}) {
    // States
    const [activeTab, setActiveTab] = useState('profile');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Profile states
    const [phone, setPhone] = useState(currentTechnician.phone);
    const [email, setEmail] = useState(currentTechnician.email);
    
    // Password states
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Notification states
    const [notifications, setNotifications] = useState({
        newJob: true,
        urgentJob: true,
        jobApproved: true,
        jobRejected: true,
        dueSoon: true
    });
    
    // Display states - โหลดจาก localStorage
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('fontSize') || 'medium';
    });
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    // Mock statistics
    const statistics = {
        totalCompleted: 145,
        successRate: 98.5,
        avgTime: '2.5 ชั่วโมง',
        currentMonth: 23
    };

    // Apply settings when component mounts or settings change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        applyFontSize(fontSize);
        applyTheme(theme);
    }, [fontSize, theme]);

    // Apply font size to document
    const applyFontSize = (size) => {
        const root = document.documentElement;
        switch (size) {
            case 'small':
                root.style.fontSize = '14px';
                break;
            case 'large':
                root.style.fontSize = '18px';
                break;
            default: // medium
                root.style.fontSize = '16px';
        }
    };

    // Apply theme to document
    const applyTheme = (mode) => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.style.setProperty('--bg-primary', '#1f2937');
            root.style.setProperty('--bg-secondary', '#111827');
            root.style.setProperty('--text-primary', '#f9fafb');
            root.style.setProperty('--text-secondary', '#d1d5db');
            root.style.setProperty('--border-color', '#374151');
            document.body.style.backgroundColor = '#111827';
            document.body.style.color = '#f9fafb';
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f9fafb');
            root.style.setProperty('--text-primary', '#111827');
            root.style.setProperty('--text-secondary', '#6b7280');
            root.style.setProperty('--border-color', '#e5e7eb');
            document.body.style.backgroundColor = '#f3f4f6';
            document.body.style.color = '#111827';
        }
    };

    // Save display settings
    const handleSaveDisplaySettings = () => {
        localStorage.setItem('fontSize', fontSize);
        localStorage.setItem('theme', theme);
        alert('บันทึกการตั้งค่าการแสดงผลสำเร็จ');
    };

    // Handlers
    const handleSaveProfile = () => {
        alert('บันทึกข้อมูลส่วนตัวสำเร็จ');
    };

    const handleChangePassword = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }
        if (passwordData.newPassword.length < 4) {
            alert('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
            return;
        }
        alert('เปลี่ยนรหัสผ่านสำเร็จ');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };

     
    const handleSaveNotifications = () => {
        alert('บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ');
    };

     
    const handleLogout = () => {
        if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
            window.location.href = '#/login';
        }
    };

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div>
                        <h3 style={{ 
                            fontSize: '22px', 
                            fontWeight: '700', 
                            marginBottom: '32px', 
                            color: '#111827',
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            borderRadius: '12px',
                            borderLeft: '4px solid #2563eb'
                        }}>
                            ข้อมูลส่วนตัว
                        </h3>

                        {/* Profile Picture */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            marginBottom: '32px' 
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '48px',
                                fontWeight: '600',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}>
                                <User size={60} />
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            {/* Name */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '10px'
                                }}>
                                    <User size={16} />
                                    ชื่อ-นามสกุล
                                </label>
                                <input
                                    type="text"
                                    value={currentTechnician.name}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '15px',
                                        backgroundColor: '#f9fafb',
                                        color: '#9ca3af',
                                        cursor: 'not-allowed',
                                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                />
                                <span style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px', display: 'block', fontStyle: 'italic' }}>
                                    💡 ติดต่อ Admin เพื่อเปลี่ยนชื่อ
                                </span>
                            </div>

                            {/* ID */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '10px'
                                }}>
                                    <Briefcase size={16} />
                                    รหัสช่าง
                                </label>
                                <input
                                    type="text"
                                    value={currentTechnician.id}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '15px',
                                        backgroundColor: '#f9fafb',
                                        color: '#9ca3af',
                                        cursor: 'not-allowed',
                                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                />
                            </div>

                            {/* Phone */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '10px'
                                }}>
                                    <Phone size={16} />
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="081-234-5678"
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '15px',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2563eb';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                    }}
                                />
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '10px'
                                }}>
                                    <Mail size={16} />
                                    อีเมล
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        borderRadius: '10px',
                                        border: '2px solid #e5e7eb',
                                        fontSize: '15px',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#2563eb';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                                    }}
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveProfile}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#1d4ed8';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#2563eb';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
                                }}
                            >
                                บันทึกข้อมูล
                            </button>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div>
                        <h3 style={{ 
                            fontSize: '22px', 
                            fontWeight: '700', 
                            marginBottom: '32px', 
                            color: '#111827',
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            borderRadius: '12px',
                            borderLeft: '4px solid #2563eb'
                        }}>
                            ความปลอดภัย
                        </h3>

                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            {/* Old Password */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <Lock size={16} />
                                    รหัสผ่านเดิม
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        placeholder="กรอกรหัสผ่านเดิม"
                                        style={{
                                            width: '100%',
                                            padding: '12px 45px 12px 16px',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#6b7280'
                                        }}
                                    >
                                        {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <Lock size={16} />
                                    รหัสผ่านใหม่
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        placeholder="กรอกรหัสผ่านใหม่"
                                        style={{
                                            width: '100%',
                                            padding: '12px 45px 12px 16px',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#6b7280'
                                        }}
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    <Lock size={16} />
                                    ยืนยันรหัสผ่านใหม่
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                        style={{
                                            width: '100%',
                                            padding: '12px 45px 12px 16px',
                                            borderRadius: '8px',
                                            border: '2px solid #e5e7eb',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#6b7280'
                                        }}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleChangePassword}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = '#1d4ed8';
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = '#2563eb';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
                                }}
                            >
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', color: '#1e40af', fontWeight: 'bold' }}>
                    ตั้งค่า
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                    จัดการข้อมูลส่วนตัวและการตั้งค่าระบบ
                </p>
            </div>

            {/* Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '32px',
                overflowX: 'auto',
                padding: '4px'
            }}>
                {[
                    { id: 'profile', icon: User, label: 'ข้อมูลส่วนตัว' },
                    { id: 'security', icon: Lock, label: 'ความปลอดภัย' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: '1 0 auto',
                            padding: '14px 24px',
                            borderRadius: '12px',
                            border: activeTab === tab.id ? '2px solid #2563eb' : '2px solid #e5e7eb',
                            background: activeTab === tab.id ? '#2563eb' : 'white',
                            color: activeTab === tab.id ? 'white' : '#6b7280',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            boxShadow: activeTab === tab.id ? '0 2px 8px rgba(37, 99, 235, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.borderColor = '#2563eb';
                                e.currentTarget.style.background = '#eff6ff';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                            }
                        }}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="page-content">
                {renderTabContent()}
            </div>
        </div>
    );
}

export default TechnicianSettings;
