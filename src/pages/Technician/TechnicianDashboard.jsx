// src/pages/Technician/TechnicianDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Upload, X, 
    MapPin, Calendar, Clock, User, 
    Briefcase, AlertCircle, FileText, 
    Image, CheckCircle, Tag, Wrench,
    ClipboardList, HourglassIcon, CheckCircle2
} from 'lucide-react';
import '../Dashboard/Dashboard.css';

function TechnicianDashboard({ 
    jobs = [], 
    currentTechnician = { id: 'tech1', name: 'สมชาย ใจดี' },
    updateJobStatus,
    acceptJob,
    setJobs
}) {
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
    const [selectedJob, setSelectedJob] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [reasonJob, setReasonJob] = useState(null);
    const [reportComment, setReportComment] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressJob, setProgressJob] = useState(null);
    const [progressNote, setProgressNote] = useState('');

    // ==========================================
    // Real-time Sync - ฟัง storage event จากแท็บอื่น
    // ==========================================
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'jobsData' && e.newValue) {
                console.log('🔄 TechnicianDashboard: Storage event detected - reloading jobs');
                if (setJobs) {
                    setJobs(JSON.parse(e.newValue));
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [setJobs]);

    // ==========================================
    // กรองเฉพาะงานของช่างคนนี้
    // ==========================================
    console.log('🔍 TechnicianDashboard - All jobs:', jobs.length);
    console.log('🔍 Current Technician:', currentTechnician);
    
    const myJobs = jobs.filter(job => {
        const match = job.technicianId === currentTechnician.id ||
                      job.technician === currentTechnician.name;
        if (match) {
            console.log('✅ Found job for technician:', job.id, job.name, 'Status:', job.status);
        }
        return match;
    });
    
    console.log('📋 My Jobs Count:', myJobs.length);

    // แยกงานตามสถานะ (รองรับทั้ง 'กำลังทำ' และ 'กำลังดำเนินการ')
    const pendingJobs = myJobs.filter(job => job.status === 'รอดำเนินการ');
    const inProgressJobs = myJobs.filter(job => 
        job.status === 'กำลังทำ' || job.status === 'กำลังดำเนินการ'
    );
    const reviewJobs = myJobs.filter(job => job.status === 'รอตรวจสอบ');
    const completedJobs = myJobs.filter(job => job.status === 'เสร็จสิ้น');

    // ==========================================
    // กรองงานตาม search & filter
    // ==========================================
    const getFilteredJobs = (jobsList) => {
        return jobsList.filter(job => {
            const lowerSearch = searchText.toLowerCase();
            const matchesSearch = 
                job.id.toLowerCase().includes(lowerSearch) ||
                job.name.toLowerCase().includes(lowerSearch) ||
                (job.location && job.location.toLowerCase().includes(lowerSearch));

            const matchesStatus = filterStatus === 'ทั้งหมด' || job.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    };

    // ==========================================
    // Helper Functions
    // ==========================================
    const getStatusClass = (status) => {
        switch (status) {
            case 'รอดำเนินการ': return 'status-badge status-pending';
            case 'กำลังทำ': return 'status-badge status-in-progress';
            case 'รอตรวจสอบ': return 'status-badge status-review';
            case 'เสร็จสิ้น': return 'status-badge status-approved';
            default: return 'status-badge';
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'ด่วนมาก': return 'priority-badge priority-urgent';
            case 'สูง': return 'priority-badge priority-high';
            case 'ปานกลาง': return 'priority-badge priority-medium';
            case 'ต่ำ': return 'priority-badge priority-low';
            default: return 'priority-badge priority-medium';
        }
    };

    // ==========================================
    // Action Handlers
    // ==========================================
    const handleStatusChange = (jobId, newStatus) => {
        if (newStatus === 'รอตรวจสอบ') {
            // ต้องกรอกรายงานก่อน
            const job = myJobs.find(j => j.id === jobId);
            setSelectedJob(job);
            setShowReportModal(true);
        } else {
            // เปลี่ยนสถานะธรรมดา
            if (updateJobStatus) {
                updateJobStatus(jobId, newStatus);
            }
        }
    };

    const handleSubmitReport = () => {
        if (!reportComment.trim()) {
            alert('กรุณากรอกข้อความรายงาน');
            return;
        }

        if (updateJobStatus) {
            updateJobStatus(selectedJob.id, 'รอตรวจสอบ', {
                comment: reportComment,
                images: uploadedImages
            });
        }

        // Reset
        setShowReportModal(false);
        setSelectedJob(null);
        setReportComment('');
        setUploadedImages([]);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setUploadedImages(prev => [...prev, ...imageUrls]);
    };

    const removeImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    // ==========================================
    // Render Action Button
    // ==========================================
    const renderActionButton = (job) => {
        switch (job.status) {
            case 'รอดำเนินการ':
                return (
                    <>
                        <button 
                            onClick={() => {
                                if (acceptJob) {
                                    acceptJob(job.id);
                                }
                            }}
                            className="approve-assign-btn"
                            style={{ backgroundColor: '#2563eb' }}
                        >
                            {job.rejected ? 'รับงานอีกครั้ง' : 'รับงาน'}
                        </button>
                        {job.rejected && job.rejectionReason && (
                            <button
                                onClick={() => {
                                    setReasonJob(job);
                                    setShowReasonModal(true);
                                }}
                                style={{
                                    padding: '6px 12px',
                                    background: '#fef3c7',
                                    border: '1px solid #fbbf24',
                                    borderRadius: '6px',
                                    color: '#92400e',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                ดูเหตุผล
                            </button>
                        )}
                    </>
                );
            case 'กำลังทำ':
            case 'กำลังดำเนินการ':
                return (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                setProgressJob(job);
                                setProgressNote('');
                                setShowProgressModal(true);
                            }}
                            style={{
                                padding: '6px 12px',
                                background: '#eff6ff',
                                border: '1px solid #3b82f6',
                                borderRadius: '6px',
                                color: '#2563eb',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            📝 บันทึกความคืบหน้า
                        </button>
                        <button 
                            onClick={() => handleStatusChange(job.id, 'รอตรวจสอบ')}
                            className="approve-assign-btn"
                            style={{ backgroundColor: '#10b981' }}
                        >
                            เสร็จสิ้น
                        </button>
                    </div>
                );
            case 'รอตรวจสอบ':
                return (
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>
                        รอหัวหน้าตรวจสอบ
                    </span>
                );
            case 'เสร็จสิ้น':
                return (
                    <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '500' }}>
                        ✓ เสร็จสมบูรณ์
                    </span>
                );
            default:
                return null;
        }
    };

    // ==========================================
    // Render Job Table
    // ==========================================
    const renderJobTable = (jobsList, title, emptyMessage) => {
        const filtered = getFilteredJobs(jobsList);

        if (filtered.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px', color: '#9ca3af' }}>
                    {emptyMessage}
                </div>
            );
        }

        return (
            <div className="table-container">
                <table className="job-table">
                    <thead>
                        <tr>
                            <th><Tag size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />รหัสงาน</th>
                            <th><FileText size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />ชื่องาน</th>
                            <th><MapPin size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />สถานที่</th>
                            <th><Calendar size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />วันที่รับ</th>
                            <th><AlertCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />ความสำคัญ</th>
                            <th><CheckCircle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />สถานะ</th>
                            <th><Briefcase size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(job => (
                            <tr key={job.id}>
                                <td style={{ fontWeight: '600', color: '#2563eb' }}>{job.id}</td>
                                <td className="job-name">{job.name}</td>
                                <td>{job.location || '-'}</td>
                                <td>{job.date}</td>
                                <td>
                                    <span className={getPriorityClass(job.priority)}>
                                        {job.priority || 'ปานกลาง'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span className={getStatusClass(job.status)}>
                                            {job.status}
                                        </span>
                                        {job.rejected && job.status === 'รอดำเนินการ' && (
                                            <span style={{ 
                                                fontSize: '12px', 
                                                color: '#dc2626', 
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                ⚠️ ถูกตีกลับ
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {renderActionButton(job)}
                                        <button 
                                            onClick={() => {
                                                setSelectedJob(job);
                                                setShowDetailModal(true);
                                            }}
                                            className="detail-btn"
                                        >
                                            รายละเอียด
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <>
            {/* Header */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', color: '#1e40af', fontWeight: 'bold' }}>
                    งานของฉัน - {currentTechnician.name}
                </h2>
            </div>

            {/* Status Cards */}
            <div className="status-cards">
                <div className="card">
                    <div className="card-label">งานทั้งหมด</div>
                    <div className="card-number">{myJobs.length}</div>
                </div>
                <div className="card">
                    <div className="card-label">รอดำเนินการ</div>
                    <div className="card-number orange">{pendingJobs.length}</div>
                </div>
                <div className="card">
                    <div className="card-label">กำลังทำ</div>
                    <div className="card-number blue">{inProgressJobs.length}</div>
                </div>
                <div className="card highlight">
                    <div className="card-label">รอตรวจสอบ ⭐</div>
                    <div className="card-number yellow">{reviewJobs.length}</div>
                </div>
                <div className="card">
                    <div className="card-label">เสร็จสิ้น</div>
                    <div className="card-number green">{completedJobs.length}</div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="search-filter-box">
                <div className="search-container">
                    <Search size={20} className="search-icon" />
                    <input
                        placeholder="ค้นหา (รหัส/ชื่องาน/สถานที่)..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* งานรอดำเนินการ */}
            <div className="page-content" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', color: '#f97316', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={24} /> งานรอดำเนินการ ({pendingJobs.length})
                </h2>
                {renderJobTable(pendingJobs, 'งานรอดำเนินการ', 'ไม่มีงานรอดำเนินการ')}
            </div>

            {/* งานที่กำลังทำ */}
            <div className="page-content" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', color: '#3b82f6', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={24} /> งานที่กำลังทำ ({inProgressJobs.length})
                </h2>
                {renderJobTable(inProgressJobs, 'งานที่กำลังทำ', 'ไม่มีงานที่กำลังทำ')}
            </div>

            {/* งานรอตรวจสอบ */}
            <div className="page-content" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', color: '#eab308', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HourglassIcon size={24} /> งานรอตรวจสอบ ({reviewJobs.length})
                </h2>
                {renderJobTable(reviewJobs, 'งานรอตรวจสอบ', 'ไม่มีงานรอตรวจสอบ')}
            </div>

            {/* งานเสร็จสิ้น */}
            <div className="page-content">
                <h2 style={{ fontSize: '20px', color: '#10b981', fontWeight: 'bold', marginBottom: '16px' }}>
                    ✓ งานเสร็จสิ้น ({completedJobs.length})
                </h2>
                {renderJobTable(completedJobs, 'งานเสร็จสิ้น', 'ยังไม่มีงานที่เสร็จสิ้น')}
            </div>

            {/* Modal รายงานผลการทำงาน */}
            {showReportModal && selectedJob && (
                <div 
                    className="modal-backdrop"
                    onClick={() => {
                        setShowReportModal(false);
                        setSelectedJob(null);
                        setReportComment('');
                        setUploadedImages([]);
                    }}
                >
                    <div 
                        className="modal-container"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '600px' }}
                    >
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={24} color="#10b981" />
                                <h3>รายงานผลการทำงาน - {selectedJob.id}</h3>
                            </div>
                            <X 
                                className="modal-close" 
                                size={24}
                                onClick={() => {
                                    setShowReportModal(false);
                                    setSelectedJob(null);
                                    setReportComment('');
                                    setUploadedImages([]);
                                }}
                            />
                        </div>

                        <div className="modal-body-content">
                            <div style={{ 
                                marginBottom: '24px',
                                padding: '16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '12px',
                                color: 'white'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Briefcase size={18} />
                                    <span style={{ fontSize: '13px', opacity: 0.9 }}>ชื่องาน</span>
                                </div>
                                <p style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{selectedJob.name}</p>
                            </div>

                            <div className="form-group full">
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '10px'
                                }}>
                                    <FileText size={18} />
                                    รายละเอียดการทำงาน <span className="required">*</span>
                                </label>
                                <textarea
                                    value={reportComment}
                                    onChange={e => setReportComment(e.target.value)}
                                    placeholder="กรอกรายละเอียดการทำงาน ปัญหาที่พบ และวิธีแก้ไข..."
                                    style={{
                                        minHeight: '140px',
                                        resize: 'vertical',
                                        borderRadius: '10px',
                                        border: '2px solid #e5e7eb',
                                        padding: '14px',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        transition: 'border-color 0.2s',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            <div className="form-group full" style={{ marginTop: '24px' }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}>
                                    <Image size={18} />
                                    อัปโหลดรูปภาพ (ถ้ามี)
                                </label>
                                <div style={{
                                    position: 'relative',
                                    border: '2px dashed #d1d5db',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    background: '#f9fafb',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6';
                                    e.currentTarget.style.background = '#eff6ff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#d1d5db';
                                    e.currentTarget.style.background = '#f9fafb';
                                }}
                                >
                                    <input 
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ 
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <Upload size={32} color="#9ca3af" style={{ marginBottom: '8px' }} />
                                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                                    </p>
                                    <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                                        รองรับไฟล์: JPG, PNG, GIF
                                    </p>
                                </div>
                                
                                {uploadedImages.length > 0 && (
                                    <div style={{ 
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                        gap: '10px',
                                        marginTop: '16px',
                                        maxWidth: '500px'
                                    }}>
                                        {uploadedImages.map((img, idx) => (
                                            <div key={idx} style={{ 
                                                position: 'relative',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                                transition: 'transform 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <img 
                                                    src={img}
                                                    alt={`อัปโหลด ${idx + 1}`}
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100px', 
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '6px',
                                                        right: '6px',
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: 0,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#dc2626';
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#ef4444';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="cancel-btn"
                                onClick={() => {
                                    setShowReportModal(false);
                                    setSelectedJob(null);
                                    setReportComment('');
                                    setUploadedImages([]);
                                }}
                            >
                                ยกเลิก
                            </button>
                            <button 
                                className="submit-btn"
                                onClick={handleSubmitReport}
                                disabled={!reportComment.trim()}
                                style={{ 
                                    backgroundColor: !reportComment.trim() ? '#9ca3af' : '#10b981',
                                    cursor: !reportComment.trim() ? 'not-allowed' : 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    if (reportComment.trim()) {
                                        e.currentTarget.style.backgroundColor = '#059669';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (reportComment.trim()) {
                                        e.currentTarget.style.backgroundColor = '#10b981';
                                    }
                                }}
                            >
                                ส่งรายงาน
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal บันทึกความคืบหน้า */}
            {showProgressModal && progressJob && (
                <div
                    className="modal-backdrop"
                    onClick={() => { setShowProgressModal(false); setProgressJob(null); setProgressNote(''); }}
                >
                    <div
                        className="modal-container"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '500px' }}
                    >
                        <div className="modal-header" style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
                            <h3 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📝 บันทึกความคืบหน้า
                            </h3>
                            <X
                                className="modal-close"
                                size={24}
                                onClick={() => { setShowProgressModal(false); setProgressJob(null); setProgressNote(''); }}
                            />
                        </div>
                        <div className="modal-body-content" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>งาน:</span>
                                <p style={{ fontWeight: '600', color: '#111827', margin: '4px 0 0' }}>
                                    [{progressJob.id}] {progressJob.name}
                                </p>
                            </div>

                            {/* แสดง progress notes เดิม */}
                            {progressJob.progressNotes && progressJob.progressNotes.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>ความคืบหน้าที่ผ่านมา:</p>
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {progressJob.progressNotes.map((note, i) => (
                                            <div key={i} style={{
                                                padding: '10px 12px',
                                                background: '#f0f9ff',
                                                borderRadius: '8px',
                                                borderLeft: '3px solid #3b82f6',
                                                fontSize: '13px'
                                            }}>
                                                <p style={{ color: '#1e40af', margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{note.text}</p>
                                                <p style={{ color: '#9ca3af', margin: 0, fontSize: '11px' }}>{new Date(note.createdAt).toLocaleString('th-TH')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                                    บันทึกความคืบหน้าใหม่:
                                </label>
                                <textarea
                                    value={progressNote}
                                    onChange={e => setProgressNote(e.target.value)}
                                    placeholder="เช่น สำรวจแล้ว ปัญหาอยู่ที่ตู้ไฟชั้น 3 / ต้องใช้สายไฟ 2.5mm / รอรับอุปกรณ์เพิ่ม..."
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => {
                                        if (!progressNote.trim()) { alert('กรุณากรอกความคืบหน้า'); return; }
                                        const newNote = { text: progressNote.trim(), createdAt: new Date().toISOString() };
                                        setJobs(prev => prev.map(j =>
                                            j.id === progressJob.id
                                                ? { ...j, progressNotes: [...(j.progressNotes || []), newNote] }
                                                : j
                                        ));
                                        setShowProgressModal(false);
                                        setProgressJob(null);
                                        setProgressNote('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    บันทึก
                                </button>
                                <button
                                    onClick={() => { setShowProgressModal(false); setProgressJob(null); setProgressNote(''); }}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#f3f4f6',
                                        color: '#374151',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal เหตุผลที่ถูกตีกลับ */}
            {showReasonModal && reasonJob && (
                <div
                    className="modal-backdrop"
                    onClick={() => { setShowReasonModal(false); setReasonJob(null); }}
                >
                    <div
                        className="modal-container"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '480px' }}
                    >
                        <div className="modal-header" style={{ background: '#fef3c7', borderBottom: '1px solid #fbbf24' }}>
                            <h3 style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                ⚠️ เหตุผลที่ถูกตีกลับ
                            </h3>
                            <X
                                className="modal-close"
                                size={24}
                                onClick={() => { setShowReasonModal(false); setReasonJob(null); }}
                            />
                        </div>
                        <div className="modal-body-content" style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>งาน:</span>
                                <p style={{ fontWeight: '600', color: '#111827', margin: '4px 0 0' }}>
                                    [{reasonJob.id}] {reasonJob.name}
                                </p>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>ข้อความจากหัวหน้าช่าง:</span>
                                <div style={{
                                    marginTop: '8px',
                                    padding: '16px',
                                    background: '#fffbeb',
                                    border: '1px solid #fbbf24',
                                    borderRadius: '8px',
                                    color: '#78350f',
                                    fontSize: '15px',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {reasonJob.rejectionReason}
                                </div>
                            </div>
                            {reasonJob.rejectedAt && (
                                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    ตีกลับเมื่อ: {new Date(reasonJob.rejectedAt).toLocaleString('th-TH')}
                                </p>
                            )}
                            <button
                                onClick={() => { setShowReasonModal(false); setReasonJob(null); }}
                                style={{
                                    marginTop: '16px',
                                    width: '100%',
                                    padding: '10px',
                                    background: '#f59e0b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal รายละเอียดงาน */}
            {showDetailModal && selectedJob && (
                <div 
                    className="modal-backdrop"
                    onClick={() => {
                        setShowDetailModal(false);
                        setSelectedJob(null);
                    }}
                >
                    <div 
                        className="modal-container"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '700px' }}
                    >
                        <div className="modal-header">
                            <h3>รายละเอียดงาน - {selectedJob.id}</h3>
                            <X 
                                className="modal-close" 
                                size={24}
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedJob(null);
                                }}
                            />
                        </div>

                        <div className="modal-body-content">
                            {/* ข้อมูลพื้นฐาน */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '20px',
                                marginBottom: '24px',
                                padding: '20px',
                                background: '#f9fafb',
                                borderRadius: '12px'
                            }}>
                                <div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        marginBottom: '6px'
                                    }}>
                                        <Briefcase size={16} />
                                        <span>ชื่องาน</span>
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                                        {selectedJob.name}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        marginBottom: '6px'
                                    }}>
                                        <Tag size={16} />
                                        <span>รหัสงาน</span>
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb' }}>
                                        {selectedJob.id}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        marginBottom: '6px'
                                    }}>
                                        <MapPin size={16} />
                                        <span>สถานที่</span>
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                                        {selectedJob.location || '-'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        marginBottom: '6px'
                                    }}>
                                        <Calendar size={16} />
                                        <span>วันที่รับงาน</span>
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#111827' }}>
                                        {selectedJob.date}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        marginBottom: '6px'
                                    }}>
                                        <AlertCircle size={16} />
                                        <span>ความสำคัญ</span>
                                    </div>
                                    <span className={getPriorityClass(selectedJob.priority)}>
                                        {selectedJob.priority || 'ปานกลาง'}
                                    </span>
                                </div>

                                <div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        marginBottom: '6px'
                                    }}>
                                        <CheckCircle size={16} />
                                        <span>สถานะ</span>
                                    </div>
                                    <span className={getStatusClass(selectedJob.status)}>
                                        {selectedJob.status}
                                    </span>
                                </div>
                            </div>

                            {/* ประเภทงาน */}
                            {selectedJob.jobType && selectedJob.jobType !== 'ไม่ระบุ' && (
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#1e40af',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '8px'
                                    }}>
                                        <FileText size={18} />
                                        <span>ประเภทงาน</span>
                                    </div>
                                    <div style={{ color: '#1e40af', fontSize: '14px' }}>
                                        {selectedJob.jobType}
                                    </div>
                                </div>
                            )}

                            {/* รายละเอียดงาน */}
                            {selectedJob.detail && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#374151',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}>
                                        📋 <span>รายละเอียดงาน</span>
                                    </div>
                                    <div style={{ 
                                        padding: '16px',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        color: '#4b5563',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        {selectedJob.detail}
                                    </div>
                                </div>
                            )}

                            {/* ข้อมูลผู้ติดต่อ */}
                            {(selectedJob.customerName || selectedJob.phone || selectedJob.email) && (
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#92400e',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}>
                                        👤 <span>ข้อมูลผู้ติดต่อ</span>
                                    </div>
                                    <div style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.8' }}>
                                        {selectedJob.customerName && <div><strong>ชื่อ:</strong> {selectedJob.customerName}</div>}
                                        {selectedJob.phone && <div><strong>เบอร์โทร:</strong> {selectedJob.phone}</div>}
                                        {selectedJob.email && <div><strong>อีเมล:</strong> {selectedJob.email}</div>}
                                    </div>
                                </div>
                            )}

                            {/* หมายเหตุ */}
                            {selectedJob.note && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#374151',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}>
                                        📝 <span>หมายเหตุ</span>
                                    </div>
                                    <div style={{ 
                                        padding: '16px',
                                        background: '#fef9e7',
                                        borderRadius: '8px',
                                        color: '#92400e',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        borderLeft: '4px solid #f59e0b',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {selectedJob.note}
                                    </div>
                                </div>
                            )}

                            {/* รายละเอียดเพิ่มเติม (สำหรับข้อมูลเก่า) */}
                            {selectedJob.description && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#374151',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}>
                                        <FileText size={18} />
                                        <span>รายละเอียดเพิ่มเติม</span>
                                    </div>
                                    <div style={{ 
                                        padding: '16px',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        color: '#4b5563',
                                        fontSize: '14px',
                                        lineHeight: '1.6'
                                    }}>
                                        {selectedJob.description}
                                    </div>
                                </div>
                            )}

                            {/* บันทึกความคืบหน้า */}
                            {selectedJob.progressNotes && selectedJob.progressNotes.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#1e40af',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}>
                                        📝 <span>บันทึกความคืบหน้า ({selectedJob.progressNotes.length} รายการ)</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedJob.progressNotes.map((note, i) => (
                                            <div key={i} style={{
                                                padding: '12px 16px',
                                                background: '#eff6ff',
                                                borderRadius: '8px',
                                                borderLeft: '4px solid #3b82f6',
                                                fontSize: '14px'
                                            }}>
                                                <p style={{ color: '#1e3a5f', margin: '0 0 6px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{note.text}</p>
                                                <p style={{ color: '#93c5fd', margin: 0, fontSize: '12px' }}>
                                                    🕐 {new Date(note.createdAt).toLocaleString('th-TH')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* รายงานผลการทำงาน */}
                            {selectedJob.technicianReport && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#065f46',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}>
                                        ✅ <span>รายงานผลการทำงาน</span>
                                    </div>
                                    <div style={{ 
                                        padding: '16px',
                                        background: '#f0fdf4',
                                        borderRadius: '8px',
                                        color: '#065f46',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        borderLeft: '4px solid #10b981',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {selectedJob.technicianReport}
                                    </div>
                                </div>
                            )}

                            {/* หมายเหตุ/ความคิดเห็น (สำหรับข้อมูลเก่า) */}
                            {selectedJob.comment && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        color: '#374151',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        marginBottom: '10px'
                                    }}>
                                        <FileText size={18} />
                                        <span>รายงานผลการทำงาน</span>
                                    </div>
                                    <div style={{ 
                                        padding: '16px',
                                        background: '#fef3c7',
                                        borderRadius: '8px',
                                        color: '#92400e',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        border: '1px solid #fde68a'
                                    }}>
                                        {selectedJob.comment}
                                    </div>
                                </div>
                            )}

                            {/* รูปภาพที่อัปโหลด - ซ่อนไว้ */}
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="cancel-btn"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedJob(null);
                                }}
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default TechnicianDashboard;
