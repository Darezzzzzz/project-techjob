// src/pages/Dashboard/SupervisorDashboard.jsx

import React, { useState } from 'react';
// ✅ 1. เพิ่ม Import ไอคอน Filter และ AlertTriangle
import { Search, Filter, AlertTriangle, X } from 'lucide-react';
import './Dashboard.css';

const MY_DEPARTMENT = 'แผนกไฟฟ้า';

function SupervisorDashboard({ jobs = [], pendingJobsCount = 0, assignJob }) {
    // ✅ 2. เพิ่ม State สำหรับ Priority
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
    const [filterPriority, setFilterPriority] = useState('ทั้งหมด');

    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState('');
    const [detailJob, setDetailJob] = useState(null);

    // ==========================================
    // แยกข้อมูล (Data Partitioning)
    // ==========================================

    // งานรอมอบหมาย - รองรับทั้งชื่อเก่า (ช่างไฟฟ้า) และชื่อใหม่ (แผนกไฟฟ้า)
    console.log('🔍 All jobs received:', jobs.map(j => ({ id: j.id, dept: j.department, tech: j.technician, status: j.status })));
    
    const pendingAssignJobs = jobs.filter(job => {
        const deptMatch = job.department === MY_DEPARTMENT || job.department === 'ช่างไฟฟ้า'; // รองรับทั้ง 2 แบบ
        const matches = deptMatch &&
            (job.technician === 'ไม่มีช่าง' || job.technician === null || !job.technician) &&
            job.status === 'รอดำเนินการ';
        
        console.log(`🔍 Job ${job.id}: dept=${job.department}, tech=${job.technician}, status=${job.status}, matches=${matches}`);
        
        return matches;
    });
    
    console.log('📋 Pending assign jobs count:', pendingAssignJobs.length);
    console.log('📋 All jobs:', jobs.length);

    // งานที่มีช่างแล้ว (สำหรับตารางล่าง) - รองรับทั้ง 2 แบบ
    const assignedJobs = jobs.filter(job => {
        const deptMatch = job.department === MY_DEPARTMENT || job.department === 'ช่างไฟฟ้า';
        return deptMatch &&
            job.technician &&
            job.technician !== 'ไม่มีช่าง' &&
            job.status !== 'เสร็จสิ้น';
    });

    // สถิติ Card - รองรับทั้ง 2 แบบ
    const deptJobs = jobs.filter(j => j.department === MY_DEPARTMENT || j.department === 'ช่างไฟฟ้า');
    const totalJobs = deptJobs.length;
    const pendingCount = deptJobs.filter(j => j.status === 'รอดำเนินการ').length;
    const inProgressCount = deptJobs.filter(j => j.status === 'กำลังดำเนินการ').length;
    const reviewCount = deptJobs.filter(j => j.status === 'รอตรวจสอบ').length;
    const completedCount = deptJobs.filter(j => j.status === 'เสร็จสิ้น').length;

    // ==========================================
    // ✅ 3. Logic การกรองข้อมูล (รวม Search + Status + Priority)
    // ==========================================
    const filteredAssignedJobs = assignedJobs.filter(job => {
        // 1. ค้นหาจาก Text
        const lowerSearch = searchText.toLowerCase();
        const matchesSearch =
            job.id.toLowerCase().includes(lowerSearch) ||
            job.name.toLowerCase().includes(lowerSearch) ||
            (job.technician && job.technician.toLowerCase().includes(lowerSearch));

        // 2. กรองสถานะ
        const matchesStatus = filterStatus === 'ทั้งหมด' || job.status === filterStatus;

        // 3. กรองความสำคัญ (Priority)
        // (เช็ค job.priority ถ้าไม่มีข้อมูลให้ถือว่าผ่าน หรือกำหนด default)
        const jobPriority = job.priority || 'ปกติ';
        const matchesPriority = filterPriority === 'ทั้งหมด' || jobPriority === filterPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Helper: สีสถานะ
    const getStatusClass = (status) => {
        switch(status) {
            case 'รอดำเนินการ': return 'status-badge status-pending';
            case 'กำลังดำเนินการ': return 'status-badge status-in-progress';
            case 'รอตรวจสอบ': return 'status-badge status-review';
            case 'เสร็จสิ้น': return 'status-badge status-completed';
            default: return 'status-badge';
        }
    };

    // Helper: สีความสำคัญ
    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'ด่วนมาก': return 'priority-badge priority-urgent';
            case 'สูง': return 'priority-badge priority-high';
            case 'ปานกลาง': return 'priority-badge priority-medium';
            case 'ต่ำ': return 'priority-badge priority-low';
            default: return 'priority-badge';        // สีเขียว/เทา
        }
    };

    const handleAssign = () => {
        if (!selectedTechnician) return;
        if (assignJob) {
            console.log(`🎯 SupervisorDashboard: Assigning ${selectedJob.id} to ${selectedTechnician}`);
            assignJob(selectedJob.id, selectedTechnician);
        }
        setSelectedJob(null);
        setSelectedTechnician('');
    };

    return (
        <>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '28px', color: '#1e40af', fontWeight: 'bold' }}>
                    {MY_DEPARTMENT}
                </h2>
            </div>

            {/* Status Cards */}
            <div className="status-cards">
                <div className="card"><div className="card-label">งานทั้งหมด</div><div className="card-number">{totalJobs}</div></div>
                <div className="card"><div className="card-label">รอดำเนินการ</div><div className="card-number orange">{pendingCount}</div></div>
                <div className="card"><div className="card-label">กำลังดำเนินการ</div><div className="card-number blue">{inProgressCount}</div></div>
                <div className="card highlight"><div className="card-label">รอตรวจสอบ ⭐</div><div className="card-number yellow">{reviewCount}</div></div>
                <div className="card"><div className="card-label">เสร็จสิ้น</div><div className="card-number green">{completedCount}</div></div>
            </div>

            {/* ตารางงานรอมอบหมาย */}
            <div className="page-content" style={{ margin: '40px 0' }}>
                <h2 style={{ fontSize: '24px', color: '#1e40af', fontWeight: 'bold', marginBottom: '20px' }}>
                    📋 งานที่รอมอบหมาย ({pendingAssignJobs.length})
                </h2>
                {pendingAssignJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '12px', color: '#9ca3af' }}>
                        ไม่มีงานที่รอมอบหมาย
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="job-table">
                            <thead>
                                <tr>
                                    <th>รหัสงาน</th>
                                    <th>ชื่องาน</th>
                                    <th>วันที่รับ</th>
                                    <th>ผู้รับงาน</th>
                                    <th>ความสำคัญ</th>
                                    <th>สถานะ</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingAssignJobs.map(job => (
                                    <tr key={job.id}>
                                        <td>{job.id}</td>
                                        <td className="job-name">{job.name}</td>
                                        <td>{job.date}</td>
                                        <td>-</td>
                                        <td>
                                            <span className={getPriorityClass(job.priority)}>
                                                {job.priority || 'ปกติ'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={getStatusClass(job.status)}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button onClick={() => setSelectedJob(job)} className="approve-assign-btn">
                                                รายละเอียด/มอบหมาย
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ส่วนติดตามงาน */}
            <div className="page-content" style={{ marginTop: '40px' }}>
                <h2 style={{ fontSize: '24px', color: '#1e40af', fontWeight: 'bold', marginBottom: '20px' }}>
                    🔍 งานที่ต้องติดตาม ({assignedJobs.length})
                </h2>

                {/* ✅ 4. ใส่ UI Filters ใหม่ตรงนี้ */}
                <div className="search-filter-box">
                    <div className="search-container">
                        <Search size={20} className="search-icon" />
                        <input
                            placeholder="ค้นหา (รหัส/ชื่อ/ช่าง)..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-container">
                        <Filter size={20} />
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                            <option value="รอตรวจสอบ">รอตรวจสอบ</option>
                        </select>
                    </div>

                    <div className="filter-container">
                        <AlertTriangle size={20} />
                        <select
                            value={filterPriority}
                            onChange={e => setFilterPriority(e.target.value)}
                            className="filter-select"
                        >
                            <option value="ทั้งหมด">ความสำคัญ: ทั้งหมด</option>
                            <option value="ด่วนมาก">ด่วนมาก</option>
                            <option value="สูง">สูง</option>
                            <option value="ปานกลาง">ปานกลาง</option>
                            <option value="ต่ำ">ต่ำ</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                {filteredAssignedJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '12px', color: '#9ca3af' }}>
                        ไม่พบงานที่ตรงกับเงื่อนไข
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="job-table">
                            <thead>
                                <tr>
                                    <th>รหัสงาน</th>
                                    <th>ชื่องาน</th>
                                    <th>วันที่รับ</th>
                                    <th>ผู้รับงาน</th>
                                    <th>สถานะ</th>
                                    <th>ความสำคัญ</th>
                                    <th>ความคืบหน้า</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssignedJobs.map(job => (
                                    <tr key={job.id}>
                                        <td>{job.id}</td>
                                        <td className="job-name">{job.name}</td>
                                        <td>{job.date}</td>
                                        <td>{job.technician}</td>
                                        <td><span className={getStatusClass(job.status)}>{job.status}</span></td>
                                        <td><span className={getPriorityClass(job.priority)}>{job.priority || 'ปกติ'}</span></td>
                                        <td>
                                            <button
                                                onClick={() => setDetailJob(job)}
                                                style={{
                                                    padding: '5px 12px',
                                                    background: job.progressNotes && job.progressNotes.length > 0 ? '#eff6ff' : '#f3f4f6',
                                                    border: job.progressNotes && job.progressNotes.length > 0 ? '1px solid #3b82f6' : '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    color: job.progressNotes && job.progressNotes.length > 0 ? '#2563eb' : '#6b7280',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {job.progressNotes && job.progressNotes.length > 0
                                                    ? `📝 ${job.progressNotes.length} รายการ`
                                                    : 'ดูรายละเอียด'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal ดูความคืบหน้า */}
            {detailJob && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setDetailJob(null)}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', borderRadius: '16px 16px 0 0' }}>
                            <h3 style={{ margin: 0, color: '#1e40af', fontSize: '18px' }}>📝 ความคืบหน้างาน [{detailJob.id}]</h3>
                            <X size={22} style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => setDetailJob(null)} />
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px', padding: '14px', background: '#f9fafb', borderRadius: '10px', lineHeight: '1.8' }}>
                                <p style={{ margin: 0 }}><strong>ชื่องาน:</strong> {detailJob.name}</p>
                                <p style={{ margin: 0 }}><strong>ช่าง:</strong> {detailJob.technician}</p>
                                <p style={{ margin: 0 }}><strong>สถานะ:</strong> <span className={getStatusClass(detailJob.status)}>{detailJob.status}</span></p>
                                <p style={{ margin: 0 }}><strong>ความสำคัญ:</strong> <span className={getPriorityClass(detailJob.priority)}>{detailJob.priority || 'ปกติ'}</span></p>
                            </div>

                            {detailJob.progressNotes && detailJob.progressNotes.length > 0 ? (
                                <div>
                                    <p style={{ fontWeight: '600', color: '#374151', marginBottom: '12px' }}>บันทึกความคืบหน้า ({detailJob.progressNotes.length} รายการ):</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {detailJob.progressNotes.map((note, i) => (
                                            <div key={i} style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                                <p style={{ margin: '0 0 6px', color: '#1e3a5f', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{note.text}</p>
                                                <p style={{ margin: 0, color: '#93c5fd', fontSize: '12px' }}>🕐 {new Date(note.createdAt).toLocaleString('th-TH')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: '#f9fafb', borderRadius: '10px' }}>
                                    ยังไม่มีการบันทึกความคืบหน้า
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', textAlign: 'right' }}>
                            <button onClick={() => setDetailJob(null)} style={{ padding: '8px 24px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer' }}>ปิด</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal มอบหมายงาน */}
            {selectedJob && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setSelectedJob(null)}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 20px', color: '#1e40af', fontSize: '24px', fontWeight: 'bold' }}>มอบหมายงาน {selectedJob.id}</h3>
                        <div style={{ marginBottom: '24px', lineHeight: '1.8', background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
                            <p><strong>ชื่องาน:</strong> {selectedJob.name}</p>
                            <p><strong>แผนก:</strong> {selectedJob.department}</p>
                            <p><strong>ความสำคัญ:</strong> <span style={{ color: selectedJob.priority === 'สูง' ? '#dc2626' : selectedJob.priority === 'ปานกลาง' ? '#f59e0b' : '#10b981' }}>{selectedJob.priority || '-'}</span></p>
                            <p><strong>ประเภทงาน:</strong> {selectedJob.jobType || '-'}</p>
                            <p><strong>วันที่รับงาน:</strong> {selectedJob.date || '-'}</p>
                            <p><strong>สถานที่:</strong> {selectedJob.location || '-'}</p>
                            {selectedJob.detail && (
                                <div style={{ marginTop: '12px' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>รายละเอียดงาน:</p>
                                    <p style={{ background: 'white', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap', border: '1px solid #e5e7eb' }}>{selectedJob.detail}</p>
                                </div>
                            )}
                            {(selectedJob.customerName || selectedJob.phone || selectedJob.email) && (
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #e5e7eb' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1e40af' }}>ข้อมูลผู้ติดต่อ:</p>
                                    {selectedJob.customerName && <p><strong>ชื่อ:</strong> {selectedJob.customerName}</p>}
                                    {selectedJob.phone && <p><strong>เบอร์โทร:</strong> {selectedJob.phone}</p>}
                                    {selectedJob.email && <p><strong>อีเมล:</strong> {selectedJob.email}</p>}
                                </div>
                            )}
                            {selectedJob.note && (
                                <div style={{ marginTop: '12px' }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>หมายเหตุ:</p>
                                    <p style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>{selectedJob.note}</p>
                                </div>
                            )}
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ fontWeight: 'bold' }}>เลือกช่าง:</p>
                            {['สมชาย ใจดี', 'สมศักดิ์ ขยัน', 'สมหญิง รักงาน'].map(name => (
                                <label key={name} style={{ display: 'block', margin: '12px 0' }}>
                                    <input type="radio" name="tech" value={name} checked={selectedTechnician === name} onChange={(e) => setSelectedTechnician(e.target.value)} style={{ marginRight: '12px' }} />
                                    {name}
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setSelectedJob(null)} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>ยกเลิก</button>
                            <button onClick={handleAssign} disabled={!selectedTechnician} style={{ padding: '12px 32px', background: selectedTechnician ? '#10b981' : '#94a3b8', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>ยืนยัน</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default SupervisorDashboard;