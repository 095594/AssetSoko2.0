import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Container, Card, Row, Col, Form, Button, Table } from "react-bootstrap";
import { FiDownload, FiCalendar, FiDollarSign, FiUsers, FiPackage } from "react-icons/fi";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ReportsIndex = ({ reports }) => {
    const [selectedReport, setSelectedReport] = useState('sales');
    const [dateRange, setDateRange] = useState('week');

    const reportTypes = [
        { id: 'sales', name: 'Sales Report', icon: <FiDollarSign /> },
        { id: 'users', name: 'User Activity', icon: <FiUsers /> },
        { id: 'assets', name: 'Asset Performance', icon: <FiPackage /> },
    ];

    const dateRanges = [
        { id: 'week', name: 'Last 7 Days' },
        { id: 'month', name: 'Last 30 Days' },
        { id: 'quarter', name: 'Last 3 Months' },
        { id: 'year', name: 'Last Year' },
    ];

    const handleExport = (format) => {
        const url = route('admin.reports.export', {
            type: selectedReport,
            format: format,
            dateRange: dateRange
        });
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${selectedReport}_report.${format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderReportContent = () => {
        switch (selectedReport) {
            case 'sales':
                return (
                    <>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <h5 className="card-title">Sales Overview</h5>
                                        <Bar
                                            data={{
                                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                                                datasets: [{
                                                    label: 'Sales (Ksh)',
                                                    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                                                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: 'Weekly Sales'
                                                    }
                                                }
                                            }}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <h5 className="card-title">Sales by Category</h5>
                                        <Pie
                                            data={{
                                                labels: ['Electronics', 'Furniture', 'Vehicles', 'Art', 'Jewelry'],
                                                datasets: [{
                                                    data: [30, 25, 15, 20, 10],
                                                    backgroundColor: [
                                                        'rgba(255, 99, 132, 0.5)',
                                                        'rgba(54, 162, 235, 0.5)',
                                                        'rgba(255, 206, 86, 0.5)',
                                                        'rgba(75, 192, 192, 0.5)',
                                                        'rgba(153, 102, 255, 0.5)',
                                                    ],
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    },
                                                }
                                            }}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Card>
                            <Card.Body>
                                <h5 className="card-title">Recent Sales</h5>
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Asset</th>
                                            <th>Buyer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.sales?.recent?.map((sale) => (
                                            <tr key={sale.id}>
                                                <td>{new Date(sale.date).toLocaleDateString()}</td>
                                                <td>{sale.asset}</td>
                                                <td>{sale.buyer}</td>
                                                <td>Ksh {sale.amount.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge bg-${sale.status === 'completed' ? 'success' : 'warning'}`}>
                                                        {sale.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </>
                );
            case 'users':
                return (
                    <Card>
                        <Card.Body>
                            <h5 className="card-title">User Activity</h5>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Last Active</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.users?.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>{new Date(user.last_active).toLocaleString()}</td>
                                            <td>{new Date(user.created_at).toLocaleString()}</td>
                                            <td>
                                                {user.id && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        href={route('admin.users.edit', { user: user.id })}
                                                    >
                                                        Edit Role
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                );
            case 'assets':
                return (
                    <Card>
                        <Card.Body>
                            <h5 className="card-title">Asset Performance</h5>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>Asset</th>
                                        <th>Category</th>
                                        <th>Views</th>
                                        <th>Bids</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.assets?.map((asset) => (
                                        <tr key={asset.id}>
                                            <td>{asset.name}</td>
                                            <td>{asset.category}</td>
                                            <td>{asset.views}</td>
                                            <td>{asset.bids}</td>
                                            <td>
                                                <span className={`badge bg-${asset.status === 'active' ? 'success' : 'secondary'}`}>
                                                    {asset.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <AdminLayout>
            <Head title="Reports" />
            <Container className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Reports</h3>
                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" onClick={() => handleExport('pdf')}>
                            <FiDownload className="me-2" />
                            Export PDF
                        </Button>
                        <Button variant="outline-success" onClick={() => handleExport('excel')}>
                            <FiDownload className="me-2" />
                            Export Excel
                        </Button>
                    </div>
                </div>

                <Card className="mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Report Type</Form.Label>
                                    <div className="d-flex gap-2">
                                        {reportTypes.map((type) => (
                                            <Button
                                                key={type.id}
                                                variant={selectedReport === type.id ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedReport(type.id)}
                                            >
                                                {type.icon}
                                                <span className="ms-2">{type.name}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date Range</Form.Label>
                                    <div className="d-flex gap-2">
                                        {dateRanges.map((range) => (
                                            <Button
                                                key={range.id}
                                                variant={dateRange === range.id ? 'primary' : 'outline-primary'}
                                                onClick={() => setDateRange(range.id)}
                                            >
                                                <FiCalendar className="me-2" />
                                                {range.name}
                                            </Button>
                                        ))}
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {renderReportContent()}
            </Container>
        </AdminLayout>
    );
};

export default ReportsIndex; 