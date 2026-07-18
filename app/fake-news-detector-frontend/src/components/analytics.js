import React from 'react';
import { Container, Row, Col, ProgressBar } from 'react-bootstrap';
import Header from './header';
import { BarChartLine, ShieldCheck, Activity, Cpu, ExclamationTriangle, Eye } from 'react-bootstrap-icons';

function Analytics() {
  document.title = 'Analytics & Insights | Veri-News AI';

  const commonPatterns = [
    { pattern: 'Health & Medical Miracle Cures', risk: 88, count: '3,420 cases' },
    { pattern: 'Conspiracy & Hidden Government Truths', risk: 94, count: '2,890 cases' },
    { pattern: 'Financial & Cryptocurrency Scams', risk: 82, count: '2,150 cases' },
    { pattern: 'Sensationalist Celebrity & Viral Hoaxes', risk: 76, count: '1,940 cases' },
  ];

  return (
    <>
      <Header activeContainer={4} />
      <Container fluid="lg" className="py-4">
        <Row className="mb-4">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="fw-extrabold mb-2" style={{ fontSize: '2.2rem' }}>
              <BarChartLine className="text-cyan me-2" color="#06b6d4" />
              Misinformation Insights & Analytics
            </h2>
            <p className="text-muted">
              Real-time platform metrics, machine learning classification statistics, and misinformation trend distribution.
            </p>
          </Col>
        </Row>

        {/* Top Stat Boxes */}
        <Row className="g-4 mb-4">
          <Col md={3} sm={6}>
            <div className="glass-card text-center">
              <Eye size={28} className="text-cyan mb-2" />
              <div className="text-muted small fw-bold text-uppercase">Total Scanned Articles</div>
              <div className="stat-number">14,892</div>
              <div className="text-success small fw-semibold">↑ 12% past week</div>
            </div>
          </Col>

          <Col md={3} sm={6}>
            <div className="glass-card text-center">
              <ExclamationTriangle size={28} className="text-warning mb-2" />
              <div className="text-muted small fw-bold text-uppercase">Misinformation Flagged</div>
              <div className="stat-number" style={{ color: '#ef4444' }}>24.3%</div>
              <div className="text-danger small fw-semibold">3,618 articles</div>
            </div>
          </Col>

          <Col md={3} sm={6}>
            <div className="glass-card text-center">
              <ShieldCheck size={28} className="text-success mb-2" />
              <div className="text-muted small fw-bold text-uppercase">Detector Precision</div>
              <div className="stat-number" style={{ color: '#10b981' }}>96.8%</div>
              <div className="text-success small fw-semibold">F1-Score benchmark</div>
            </div>
          </Col>

          <Col md={3} sm={6}>
            <div className="glass-card text-center">
              <Activity size={28} className="text-info mb-2" />
              <div className="text-muted small fw-bold text-uppercase">Avg Model Latency</div>
              <div className="stat-number" style={{ color: '#38bdf8' }}>42ms</div>
              <div className="text-info small fw-semibold">Sub-second response</div>
            </div>
          </Col>
        </Row>

        <Row className="g-4 mb-4">
          {/* Pattern Breakdown */}
          <Col lg={7}>
            <div className="glass-card h-100">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-light">
                <ExclamationTriangle color="#f59e0b" /> Dominant Misinformation Categories
              </h5>
              
              {commonPatterns.map((item, idx) => (
                <div key={idx} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold text-light">{item.pattern}</span>
                    <span className="text-muted small">{item.count}</span>
                  </div>
                  <ProgressBar
                    now={item.risk}
                    variant={item.risk > 85 ? 'danger' : 'warning'}
                    style={{ height: '8px', background: 'rgba(255,255,255,0.1)' }}
                  />
                </div>
              ))}
            </div>
          </Col>

          {/* Model Health Card */}
          <Col lg={5}>
            <div className="glass-card h-100">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-light">
                <Cpu color="#06b6d4" /> Model Architecture Status
              </h5>

              <div className="p-3 mb-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-glass)' }}>
                <div className="fw-bold text-cyan mb-1">Naive Bayes TF-IDF Classifier</div>
                <p className="small text-muted mb-0">Multinomial Naive Bayes trained on multi-source journalism corpus.</p>
              </div>

              <div className="p-3 mb-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-glass)' }}>
                <div className="fw-bold text-cyan mb-1">Linguistic Sensationalism Meter</div>
                <p className="small text-muted mb-0">Heuristic engine monitoring capitalization density & clickbait trigger phrases.</p>
              </div>

              <div className="p-3 rounded-3" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-glass)' }}>
                <div className="fw-bold text-cyan mb-1">Live Web Scraper Engine</div>
                <p className="small text-muted mb-0">BeautifulSoup + requests pipeline for instant URL article analysis.</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Analytics;
