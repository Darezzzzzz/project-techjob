// ========================================
// ReportManagement.jsx - หน้ารายงานสรุป
// ========================================

import React, { useState } from 'react';
import { Calendar, Download, Printer, FileText } from 'lucide-react';
import './ReportManagement.css'; // อ้างอิงสไตล์ที่เปลี่ยนชื่อกลับมา

// ========================================
// ข้อมูลตัวอย่างสำหรับรายงาน
// ========================================
const mockReportData = {
    overview: {
        totalJobs: 156,
        completed: 142,
        delayed: 8,
        inProgress: 6
    },
    monthlyData: [
        { month: 'มีนาคม', jobs: 15, completed: 15 },
        { month: 'เมษายน', jobs: 17, completed: 17 },
        { month: 'พฤษภาคม', jobs: 17, completed: 17 },
        { month: 'มิถุนายน', jobs: 17, completed: 17 },
        { month: 'กรกฎาคม', jobs: 17, completed: 17 },
        { month: 'สิงหาคม', jobs: 15, completed: 15 }
    ],
    statusBreakdown: {
        pending: 8,
        inProgress: 6,
        completed: 142,
        review: 0
    },
    technicianPerformance: [
        { name: 'สมศักดิ์ ขยัน', assigned: 48, completed: 47, successRate: 99 },
        { name: 'สมชาย ใจดี', assigned: 47, completed: 46, successRate: 99 },
        { name: 'สมหญิง รักงาน', assigned: 47, completed: 46, successRate: 99 },
    ]
};

// ========================================
// ReportManagement Component
// ========================================
function ReportManagement() {
    const [dateRange, setDateRange] = useState('thisMonth');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // ========================================
    // ฟังก์ชันส่งออกรายงาน
    // ========================================
    const handleExport = (type) => {
        alert(`กำลังส่งออกรายงานเป็น ${type}`);
    };

    // ========================================
    // คำนวณค่าสูงสุดของกราฟ (เพื่อปรับความสูงของแท่ง)
    // ========================================
    const maxJobs = Math.max(...mockReportData.monthlyData.map(d => d.jobs));

    // ========================================
    // คำนวณเปอร์เซ็นต์สถานะ
    // ========================================
    const totalStatus = Object.values(mockReportData.statusBreakdown).reduce((a, b) => a + b, 0);

    const calculatePercentage = (count) =>
        totalStatus > 0 ? ((count / totalStatus) * 100).toFixed(1) : 0.0;

    const statusPercentages = {
        pending: calculatePercentage(mockReportData.statusBreakdown.pending),
        inProgress: calculatePercentage(mockReportData.statusBreakdown.inProgress),
        completed: calculatePercentage(mockReportData.statusBreakdown.completed),
        review: calculatePercentage(mockReportData.statusBreakdown.review)
    };

    // ========================================
    // คำนวณค่า Insight
    // ========================================

    // อัตราความสำเร็จรวม
    const totalCompleted = mockReportData.overview.completed;
    const totalAssigned = mockReportData.overview.totalJobs;
    const overallSuccessRate = totalAssigned > 0
        ? ((totalCompleted / totalAssigned) * 100).toFixed(0)
        : 0;

    // ช่างที่มีประสิทธิภาพสูงสุด
    const bestTechnician = mockReportData.technicianPerformance.reduce((prev, current) => {
        return (prev.successRate > current.successRate) ? prev : current;
    });

    // เดือนที่มีงานมากที่สุด
    const busiestMonth = mockReportData.monthlyData.reduce((prev, current) => {
        return (prev.jobs > current.jobs) ? prev : current;
    });

    return (
        <div className="report-container">
            {/* ========================================
          Header Section - ส่วนหัว
          ======================================== */}
            <div className="report-header">
                <div>
                    <h2 className="report-title">📈 รายงานสรุป</h2>
                </div>
            </div>



            {/* ========================================
          Overview Cards - การ์ดภาพรวม
          ======================================== */}
            {/* <div className="overview-cards">
                <div className="overview-card">
                    <div className="card-icon">📋</div>
                    <div className="card-content">
                        <div className="card-label">งานทั้งหมด</div>
                        <div className="card-value">156</div>
                    </div>
                </div>

                <div className="overview-card">
                    <div className="card-icon green">✅</div>
                    <div className="card-content">
                        <div className="card-label">เสร็จสิ้น</div>
                        <div className="card-value">142</div>
                    </div>
                </div>

                <div className="overview-card">
                    <div className="card-icon blue">⏱️</div>
                    <div className="card-content">
                        <div className="card-label">กำลังดำเนินการ</div>
                        <div className="card-value">3</div>
                    </div>
                </div>

                <div className="overview-card">
                    <div className="card-icon orange">⚠️</div>
                    <div className="card-content">
                        <div className="card-label">รอดำเนินการ</div>
                        <div className="card-value">11</div>
                    </div>
                </div>
            </div> */}

            

            {/* ========================================
          Charts Section - ส่วนกราฟ
          ======================================== */}
            <div className="charts-section">
                {/* กราฟแท่งรายเดือน */}
                <div className="chart-box">
                    <h3 className="chart-title">งานรายเดือน</h3>

                    <div className="bar-chart">
                        {mockReportData.monthlyData.map((data, index) => (
                            <div key={index} className="bar-group">
                                <div className="bar-container">
                                    <div
                                        className="bar assigned"
                                        style={{ height: `${(data.jobs / maxJobs) * 100}%` }}
                                    >
                                        <span className="bar-value">{data.jobs}</span>
                                    </div>
                                    <div
                                        className="bar completed"
                                        style={{ height: `${(data.completed / maxJobs) * 100}%` }}
                                    >
                                        <span className="bar-value">{data.completed}</span>
                                    </div>
                                </div>
                                <div className="bar-label">{data.month}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-color assigned"></span>
                            <span>รับงาน</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color completed"></span>
                            <span>เสร็จสิ้น</span>
                        </div>
                    </div>
                </div>

                {/* กราฟวงกลมสถานะงาน */}
                <div className="chart-box">
                    <h3 className="chart-title">สัดส่วนสถานะงาน</h3>

                    <div className="pie-chart">
                        <div className="pie-slice completed"
                            style={{ '--percentage': statusPercentages.completed }}>
                        </div>
                        <div className="pie-center">
                            <div className="pie-total">{totalStatus}</div>
                            <div className="pie-label">งานทั้งหมด</div>
                        </div>
                    </div>
                    <div className="status-legend">
                        <div className="status-item">
                            <span className="status-dot completed"></span>
                            <span>เสร็จแล้ว: {mockReportData.statusBreakdown.completed} ({statusPercentages.completed}%)</span>
                        </div>
                        <div className="status-item">
                            <span className="status-dot progress"></span>
                            <span>กำลังทำ: {mockReportData.statusBreakdown.inProgress} ({statusPercentages.inProgress}%)</span>
                        </div>
                        <div className="status-item">
                            <span className="status-dot pending"></span>
                            <span>รอดำเนินการ: {mockReportData.statusBreakdown.pending} ({statusPercentages.pending}%)</span>
                        </div>
                        <div className="status-item">
                            <span className="status-dot review"></span>
                            <span>รอตรวจสอบ: {mockReportData.statusBreakdown.review} ({statusPercentages.review}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            

            {/* ========================================
          Technician Performance Table - ตารางประสิทธิภาพช่าง
          ======================================== */}
            <div className="performance-box">
                <h3 className="section-title">📊 สรุปผลการทำงานรายช่าง</h3>
                <div className="performance-table-container">
                    <table className="performance-table">
                        <thead>
                            <tr>
                                <th>ลำดับ</th>
                                <th>ชื่อช่าง</th>
                                <th>รับงาน</th>
                                <th>เสร็จแล้ว</th>
                                <th>อัตราสำเร็จ</th>
                                <th>ประสิทธิภาพ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockReportData.technicianPerformance.map((tech, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="tech-name">{tech.name}</td>
                                    <td>{tech.assigned}</td>
                                    <td>{tech.completed}</td>
                                    <td>{tech.successRate.toFixed(1)}%</td>
                                    <td>
                                        <div className="progress-bar-container">
                                            <div
                                                className="progress-bar"
                                                style={{ width: `${tech.successRate}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            

            {/* ========================================
          Insights Section - ข้อมูลเชิงลึก
          ======================================== */}
            <div className="insights-section">
                <div className="insight-box">
                    <h4 className="insight-title">💡 ข้อมูลเชิงลึก</h4>
                    <ul className="insight-list">
                        <li>⭐ ช่างที่มีประสิทธิภาพสูงสุด: สมศักดิ์ ขยัน ({bestTechnician.successRate.toFixed(1)}%)</li>
                        <li>📈 เดือนที่มีงานมากที่สุด: 17 งาน</li>
                        <li>⚡ เวลาเฉลี่ยในการทำงาน: 2.5 วัน</li>
                        <li>🎯 อัตราความสำเร็จโดยรวม: 99%</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default ReportManagement;