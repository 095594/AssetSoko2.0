import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Container, Navbar, Nav, NavDropdown, Button, Badge } from "react-bootstrap";
import { 
    FiMenu, FiX, FiHome, FiShoppingBag, FiHeart, FiDollarSign, 
    FiBell, FiUser, FiSettings, FiLogOut, FiPlus, FiList, 
    FiTrendingUp, FiSun, FiMoon, FiSearch, FiShoppingCart, FiGrid 
} from "react-icons/fi";
import { formatCurrency } from '@/utils/format';

const NavItem = ({ icon: Icon, label, href, isActive, isCollapsed, badge }) => (
    <Link
        href={href}
        className={`nav-item d-flex align-items-center p-3 rounded-3 mb-2 text-decoration-none transition-all ${
            isActive 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-dark hover-bg-light'
        } ${isCollapsed ? 'justify-content-center' : ''}`}
    >
        <div className="position-relative">
            <Icon className={isCollapsed ? '' : 'me-3'} size={20} />
            {badge && (
                <Badge 
                    bg="danger" 
                    className="position-absolute top-0 start-100 translate-middle rounded-pill"
                    style={{ fontSize: '0.6rem' }}
                >
                    {badge}
                </Badge>
            )}
        </div>
        {!isCollapsed && <span>{label}</span>}
    </Link>
);

const BuyerLayout = ({ children }) => {
    const { auth, url: currentUrl } = usePage().props;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(auth?.user?.dark_mode ?? false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark-mode');
    };

    const isActive = (path) => {
        return currentUrl?.startsWith(path) ?? false;
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    return (
        <div className={`d-flex ${isDarkMode ? 'dark-mode' : ''}`}>
            {/* Sidebar */}
            <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isDarkMode ? 'dark' : ''}`}>
                <div className="sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom">
                    {!isCollapsed && (
                        <div className="d-flex align-items-center">
                            <img 
                                src="/images/logo.svg" 
                                alt="Asset Soko" 
                                className="me-2"
                                style={{ width: '32px', height: '32px' }}
                            />
                            <h5 className="mb-0">Asset Soko</h5>
                        </div>
                    )}
                    <button 
                        className="btn btn-link p-0 text-decoration-none" 
                        onClick={toggleSidebar}
                        style={{ color: isDarkMode ? '#fff' : '#000' }}
                    >
                        {isCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
                    </button>
                </div>

                <div className="sidebar-content p-3">
                    <div className="nav-section mb-4">
                        <div className="nav-section-title mb-2 text-muted small text-uppercase">
                            {!isCollapsed && "MAIN"}
                        </div>
                        <NavItem
                            icon={FiHome}
                            label="Dashboard"
                            href={route('buyer.dashboard')}
                            isActive={isActive('/buyer/dashboard')}
                            isCollapsed={isCollapsed}
                        />
                    </div>

                    <div className="nav-section mb-4">
                        <div className="nav-section-title mb-2 text-muted small text-uppercase">
                            {!isCollapsed && "BUY"}
                        </div>
                        <NavItem
                            icon={FiGrid}
                            label="Browse Assets"
                            href={route('buyer.assets.index')}
                            isActive={isActive('/buyer/assets')}
                            isCollapsed={isCollapsed}
                        />
                        <NavItem
                            icon={FiHeart}
                            label="Watchlist"
                            href={route('buyer.watchlist')}
                            isActive={isActive('/buyer/watchlist')}
                            isCollapsed={isCollapsed}
                        />
                        <NavItem
                            icon={FiDollarSign}
                            label="My Bids"
                            href={route('buyer.bids.index')}
                            isActive={isActive('/buyer/bids')}
                            isCollapsed={isCollapsed}
                        />
                    </div>

                    <div className="nav-section mb-4">
                        <div className="nav-section-title mb-2 text-muted small text-uppercase">
                            {!isCollapsed && "SELL"}
                        </div>
                        <NavItem
                            icon={FiPlus}
                            label="List New Asset"
                            href={route('seller.assets.create')}
                            isActive={isActive('/seller/assets/create')}
                            isCollapsed={isCollapsed}
                        />
                        <NavItem
                            icon={FiList}
                            label="My Listings"
                            href={route('seller.assets.index')}
                            isActive={isActive('/seller/assets')}
                            isCollapsed={isCollapsed}
                        />
                        <NavItem
                            icon={FiTrendingUp}
                            label="Asset Bids"
                            href={route('seller.bids.index')}
                            isActive={isActive('/seller/bids')}
                            isCollapsed={isCollapsed}
                        />
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title mb-2 text-muted small text-uppercase">
                            {!isCollapsed && "SETTINGS"}
                        </div>
                        <NavItem
                            icon={FiSettings}
                            label="Settings"
                            href={route('settings')}
                            isActive={isActive('/settings')}
                            isCollapsed={isCollapsed}
                        />
                        <button 
                            onClick={handleLogout}
                            className={`nav-item d-flex align-items-center p-3 rounded-3 mb-2 text-decoration-none transition-all text-dark hover-bg-light w-100 border-0 bg-transparent ${
                                isCollapsed ? 'justify-content-center' : ''
                            }`}
                        >
                            <FiLogOut className={isCollapsed ? '' : 'me-3'} size={20} />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="main-content flex-grow-1">
                {/* Top Navbar */}
                <nav className={`navbar navbar-expand-lg border-bottom ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}>
                    <div className="container-fluid">
                        {/* Search Bar */}
                        <div className="d-flex align-items-center">
                            <div className="me-3">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search assets..."
                                    />
                                    <Button variant="outline-secondary">
                                        <FiSearch />
                        </Button>
                                </div>
                            </div>

                            {/* Notifications */}
                            <Link 
                                href={route('notifications.index')}
                                className="btn btn-link position-relative me-3"
                            >
                                <FiBell size={24} />
                                {unreadNotifications > 0 && (
                                    <Badge 
                                        bg="danger" 
                                        className="position-absolute top-0 start-100 translate-middle rounded-pill"
                                        style={{ fontSize: '0.6rem' }}
                                    >
                                        {unreadNotifications}
                                    </Badge>
                                )}
                            </Link>

                            {/* Dark Mode Toggle */}
                            <Button 
                                variant="link"
                                className="me-3"
                                onClick={toggleDarkMode} 
                            >
                                {isDarkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
                            </Button>
                        </div>

                        {/* User Menu - Moved to the end */}
                        <div className="ms-auto">
                            <NavDropdown 
                                title={
                                    <div className="d-flex align-items-center">
                                        <FiUser className="me-2" size={24} />
                                        <span>{auth?.user?.name}</span>
                                    </div>
                                } 
                                id="user-dropdown"
                            >
                                <NavDropdown.Item href={route('profile.edit')}>
                                    Profile
                                </NavDropdown.Item>
                                <NavDropdown.Item href={route('settings')}>
                                    Settings
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        </div>
                    </div>
                </nav>

                {/* Page Content */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BuyerLayout;