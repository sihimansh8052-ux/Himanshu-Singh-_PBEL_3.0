import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Header from './header';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { 
  Check2Circle, XCircle, Search, Activity 
} from 'react-bootstrap-icons';

function CheckByTitle() {
  document.title = 'AI News Verification | Direct Checker';

  const [inputNews, setInputNews] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = (e) => {
    if (e) e.preventDefault();

    const query = inputNews.trim();
    if (!query) {
      toast.error('Kripya koi bhi news headline, article ya URL enter karein!');
      return;
    }

    setIsLoading(true);
    setResult(null);

    // Auto-detect if input is a URL
    const isUrl = query.startsWith('http://') || query.startsWith('https://');

    const endpoint = isUrl 
      ? 'http://127.0.0.1:8000/api/usercheck/title/url/' 
      : 'http://127.0.0.1:8000/api/usercheck/title/';

    const payload = isUrl 
      ? { url: query } 
      : { user_news: query };

    Axios.post(endpoint, payload)
      .then((response) => {
        setResult(response.data);
        if (response.data.prediction) {
          toast.success('🟢 REAL NEWS DETECTED');
        } else {
          toast.error('🔴 FAKE NEWS DETECTED');
        }
      })
      .catch((error) => {
        console.error('Error verifying news:', error);
        toast.error('AI Check failed. Please check backend server.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      <Header activeContainer={2} />
      <Container fluid="lg" className="py-5">
        <Row className="justify-content-center text-center mb-4">
          <Col lg={8}>
            <h1 className="fw-extrabold mb-3" style={{ fontSize: '2.5rem', letterSpacing: '-1px' }}>
              Instant AI Fake News Detector
            </h1>
            <p className="text-secondary lead fs-5">
              Koi bhi news headline, article text ya link dalein — AI turant batayega ki news <strong>REAL</strong> hai ya <strong>FAKE</strong>.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={9}>
            {/* Input Form */}
            <div className="glass-card mb-4 p-4">
              <Form onSubmit={handleVerify}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold text-cyan fs-5 mb-2">
                    Enter News Headline, Article, or Web Link
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    className="glass-input fs-5 p-3"
                    placeholder="E.g. Paste headline like 'NASA discovers water on exoplanet' OR paste news link..."
                    value={inputNews}
                    onChange={(e) => setInputNews(e.target.value)}
                  />
                </Form.Group>
                
                <Button 
                  variant="cyan" 
                  type="submit" 
                  className="btn-cyan w-100 py-3 fs-5 fw-bold" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Activity className="spinner-border spinner-border-sm me-2" /> Checking with AI Models...
                    </>
                  ) : (
                    <>
                      <Search className="me-2" /> Check News Now (Direct Result)
                    </>
                  )}
                </Button>
              </Form>
            </div>

            {/* Direct Result Banner */}
            {result && (
              <div 
                className="glass-card mb-4 p-4 text-center animate__animated animate__fadeIn"
                style={{
                  border: result.prediction ? '2px solid #10b981' : '2px solid #ef4444',
                  boxShadow: result.prediction ? '0 0 25px rgba(16, 185, 129, 0.3)' : '0 0 25px rgba(239, 68, 68, 0.3)'
                }}
              >
                {/* Verdict Badge */}
                <div className="mb-3">
                  {result.prediction ? (
                    <div className="d-inline-flex align-items-center gap-3 px-4 py-3 rounded-pill" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981' }}>
                      <Check2Circle size={42} color="#10b981" />
                      <div className="text-start">
                        <div className="fw-black text-white fs-2" style={{ color: '#10b981' }}>THIS NEWS IS REAL</div>
                        <div className="text-success fw-bold">Authenticity Score: {result.real_probability}%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="d-inline-flex align-items-center gap-3 px-4 py-3 rounded-pill" style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444' }}>
                      <XCircle size={42} color="#ef4444" />
                      <div className="text-start">
                        <div className="fw-black text-white fs-2" style={{ color: '#ef4444' }}>THIS NEWS IS FAKE</div>
                        <div className="text-danger fw-bold">Fake Risk Score: {result.fake_probability}%</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Score Progress Bar */}
                <div className="mx-auto my-4" style={{ maxWidth: '500px' }}>
                  <div className="d-flex justify-content-between mb-1 small fw-bold">
                    <span className="text-danger">FAKE RISK: {result.fake_probability}%</span>
                    <span className="text-success">REAL SCORE: {result.real_probability}%</span>
                  </div>
                  <div className="meter-bar-container" style={{ height: '14px' }}>
                    <div
                      className={result.prediction ? 'meter-bar-fill-real' : 'meter-bar-fill-fake'}
                      style={{ width: `${result.real_probability}%` }}
                    ></div>
                  </div>
                </div>

                {/* Flagged Red Flags if Fake */}
                {result.flagged_keywords && result.flagged_keywords.length > 0 && (
                  <div className="mb-3">
                    <span className="text-warning fw-bold small me-2">⚠️ Flagged Words:</span>
                    {result.flagged_keywords.map((kw, idx) => (
                      <span key={idx} className="keyword-pill me-1 mb-1">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Plain Rationale */}
                <div className="p-3 rounded-3 mt-3 text-start" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="fw-bold text-cyan small mb-1">💡 AI EXPLANATION:</div>
                  <p className="mb-0 text-light fs-6" style={{ lineHeight: '1.6' }}>
                    {result.summary}
                  </p>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}

export default CheckByTitle;
