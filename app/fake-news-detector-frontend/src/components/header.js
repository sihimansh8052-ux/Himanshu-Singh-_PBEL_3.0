import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { ShieldCheck, Broadcast, Cpu, Trophy, BarChartLine } from 'react-bootstrap-icons';

function Header(props) {
  const { activeContainer } = props;

  const categories = [
    { name: 'World', path: 'world' },
    { name: 'Politics', path: 'politics' },
    { name: 'Technology', path: 'technology' },
    { name: 'Business', path: 'business' },
    { name: 'Environment', path: 'environment' },
    { name: 'Sport', path: 'sport' },
    { name: 'Lifestyle', path: 'lifestyle' },
    { name: 'Arts & Design', path: 'artanddesign' },
    { name: 'UK News', path: 'uknews' },
    { name: 'US News', path: 'usnews' }
  ];

  return (
    <header className="app-header">
      <Container fluid="lg">
        <Navbar expand="lg" variant="dark" className="p-0">
          <LinkContainer to="/">
            <Navbar.Brand href="/" className="d-flex align-items-center">
              <ShieldCheck className="me-2" size={26} color="#06b6d4" />
              <span className="brand-logo-text">VERI-NEWS AI</span>
              <span className="brand-badge ms-2">PRO</span>
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="header-navbar" />

          <Navbar.Collapse id="header-navbar" className="justify-content-end mt-2 mt-lg-0">
            <Nav className="align-items-center gap-1">
              <LinkContainer to="/">
                <Nav.Link className={`nav-link-custom ${activeContainer === 1 ? 'active-link' : ''}`}>
                  <Broadcast className="me-1" /> Live Radar
                </Nav.Link>
              </LinkContainer>

              <LinkContainer to="/checkbytitle">
                <Nav.Link className={`nav-link-custom ${activeContainer === 2 ? 'active-link' : ''}`}>
                  <Cpu className="me-1" /> AI Detector Studio
                </Nav.Link>
              </LinkContainer>

              <LinkContainer to="/newsquiz">
                <Nav.Link className={`nav-link-custom ${activeContainer === 3 ? 'active-link' : ''}`}>
                  <Trophy className="me-1" /> AI News Quiz
                </Nav.Link>
              </LinkContainer>

              <LinkContainer to="/analytics">
                <Nav.Link className={`nav-link-custom ${activeContainer === 4 ? 'active-link' : ''}`}>
                  <BarChartLine className="me-1" /> Analytics
                </Nav.Link>
              </LinkContainer>

              <NavDropdown
                title="Categories"
                id="nav-dropdown"
                menuRole="menu"
                className="nav-link-custom p-0"
              >
                <div className="dropdown-menu-dark-custom">
                  {categories.map((cat, idx) => (
                    <LinkContainer key={idx} to={`/category/${cat.path}`}>
                      <NavDropdown.Item>{cat.name}</NavDropdown.Item>
                    </LinkContainer>
                  ))}
                </div>
              </NavDropdown>

              <div className="ms-lg-3 mt-2 mt-lg-0">
                <div className="live-status-pill">
                  <span className="pulse-dot"></span>
                  AI MONITOR ACTIVE
                </div>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    </header>
  );
}

export default Header;