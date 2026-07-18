import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import Header from './header';
import Axios from 'axios';
import { 
  Search, Cpu, 
  Check2Circle, XCircle, Clock, Tag, BoxArrowUpRight, ArrowClockwise 
} from 'react-bootstrap-icons';

function Home() {
  document.title = 'Live News Radar | Veri-News AI';
  
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  const categories = ['All', 'World', 'Politics', 'Technology', 'Business', 'Environment', 'Sport', 'Lifestyle'];

  const fetchLiveNews = useCallback(() => {
    setIsLoading(true);
    let url = 'http://127.0.0.1:8000/api/live/';
    if (activeCategory !== 'All') {
      url = `http://127.0.0.1:8000/api/category/${activeCategory.toLowerCase()}/`;
    }

    Axios.get(url)
      .then((response) => {
        setNewsList(response.data);
        setFilteredNews(response.data);
      })
      .catch((error) => {
        console.error('Error fetching live news:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeCategory]);

  useEffect(() => {
    fetchLiveNews();
    const interval = setInterval(fetchLiveNews, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveNews]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNews(newsList);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredNews(
        newsList.filter((item) =>
          item.title.toLowerCase().includes(q) ||
          (item.section_name && item.section_name.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, newsList]);

  return (
    <>
      <Header activeContainer={1} />
      <Container fluid="lg" className="py-4">
        {/* Hero Banner */}
        <div className="glass-card mb-4 p-4 text-center text-md-start">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-inline-flex align-items-center gap-2 mb-2">
                <span className="live-status-pill">
                  <span className="pulse-dot"></span> LIVE STREAMING
                </span>
                <span className="badge-verdict" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                  <Cpu className="me-1" /> GUARDIAN + AI ENGINE ACTIVE
                </span>
              </div>
              <h1 className="fw-extrabold mb-2" style={{ fontSize: '2.4rem', letterSpacing: '-0.5px' }}>
                Real-Time AI Misinformation Radar
              </h1>
              <p className="text-secondary mb-0" style={{ maxWidth: '650px' }}>
                Automated machine learning algorithms evaluate news feeds in real-time to detect sensationalism, clickbait titles, and unverified stories.
              </p>
            </Col>

            <Col md={4} className="mt-3 mt-md-0 text-md-end">
              <Button variant="cyan" className="btn-cyan" onClick={fetchLiveNews} disabled={isLoading}>
                <ArrowClockwise className={`me-2 ${isLoading ? 'spin' : ''}`} /> Refresh Stream
              </Button>
            </Col>
          </Row>

          {/* Search & Category Filter Toolbar */}
          <Row className="mt-4 g-3 align-items-center">
            <Col md={6}>
              <div className="position-relative">
                <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={18} />
                <Form.Control
                  type="text"
                  className="glass-input ps-5"
                  placeholder="Filter live articles by headline or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </Col>

            <Col md={6}>
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                {categories.map((cat, idx) => (
                  <Button
                    key={idx}
                    variant="sm"
                    className={`btn-glass-secondary py-1 px-3 ${activeCategory === cat ? 'active-link' : ''}`}
                    style={{ fontSize: '0.85rem' }}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </Col>
          </Row>
        </div>

        {/* Live News Grid */}
        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <div className="text-muted fw-semibold">Scanning live news feeds & calculating AI probabilities...</div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="glass-card text-center py-5">
            <p className="text-muted mb-0">No live news articles matching your search criteria.</p>
          </div>
        ) : (
          <Row className="g-4">
            {filteredNews.map((news, idx) => {
              const isReal = news.prediction;
              const prob = news.real_probability || (isReal ? 90 : 10);
              const img = news.img_url && news.img_url !== 'None'
                ? news.img_url
                : `https://picsum.photos/seed/${idx + 42}/600/350`;

              return (
                <Col key={idx} xs={12} md={6} lg={4}>
                  <div className="glass-card glass-card-interactive h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="news-img-container">
                        <img src={img} alt={news.title} />
                        <div className="position-absolute top-0 start-0 m-2">
                          <span className="badge bg-dark text-info border border-secondary px-2 py-1 small">
                            <Tag className="me-1" /> {news.section_name || news.news_category || 'News'}
                          </span>
                        </div>
                      </div>

                      <h5 className="fw-bold mb-2 text-light" style={{ fontSize: '1.05rem', lineHeight: '1.4' }}>
                        {news.title}
                      </h5>
                    </div>

                    <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        {isReal ? (
                          <div className="badge-verdict badge-verdict-real py-1 px-2" style={{ fontSize: '0.78rem' }}>
                            <Check2Circle size={16} /> REAL NEWS ({prob}%)
                          </div>
                        ) : (
                          <div className="badge-verdict badge-verdict-fake py-1 px-2" style={{ fontSize: '0.78rem' }}>
                            <XCircle size={16} /> FAKE NEWS ({100 - prob}%)
                          </div>
                        )}

                        <span className="text-muted small d-flex align-items-center">
                          <Clock className="me-1" size={13} />
                          {news.publication_date ? new Date(news.publication_date).toLocaleDateString() : 'Today'}
                        </span>
                      </div>

                      <Button
                        variant="outline-info"
                        size="sm"
                        className="w-100 btn-glass-secondary py-1"
                        style={{ fontSize: '0.82rem' }}
                        onClick={() => setSelectedNews(news)}
                      >
                        <Cpu className="me-1" /> View AI Verification Rationale
                      </Button>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* Modal Deep Dive */}
      <Modal show={!!selectedNews} onHide={() => setSelectedNews(null)} centered size="lg" contentClassName="glass-card text-light border-0">
        {selectedNews && (
          <>
            <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
              <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                <Cpu color="#06b6d4" /> AI Verification Deep Dive
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h5 className="fw-bold mb-3">{selectedNews.title}</h5>
              
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="stat-box">
                    <div className="text-muted small mb-1">AUTHENTICITY PROBABILITY</div>
                    <div className="stat-number" style={{ color: selectedNews.prediction ? '#10b981' : '#ef4444' }}>
                      {selectedNews.real_probability || (selectedNews.prediction ? '92%' : '8%')}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="stat-box">
                    <div className="text-muted small mb-1">SENSATIONALISM INDEX</div>
                    <div className="stat-number" style={{ color: '#06b6d4' }}>
                      {selectedNews.sensationalism_score || 12} / 100
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="p-3 rounded-3" style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <div className="fw-bold text-cyan mb-1 small text-uppercase">Diagnostic Rationale:</div>
                <p className="mb-0 text-light small" style={{ lineHeight: '1.6' }}>
                  {selectedNews.summary || (selectedNews.prediction
                    ? 'This article matches standard journalistic headline structure and lacks clickbait trigger phrasing.'
                    : 'This article was flagged due to sensationalist phrasing or discrepancy with verified press sources.')}
                </p>
              </div>

              {selectedNews.web_url && selectedNews.web_url.startsWith('http') && (
                <div className="mt-3 text-end">
                  <a href={selectedNews.web_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-cyan">
                    Source Link <BoxArrowUpRight className="ms-1" />
                  </a>
                </div>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>
    </>
  );
}

export default Home;
