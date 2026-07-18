import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { Check2Circle, XCircle, Clock, Tag, Cpu } from 'react-bootstrap-icons';
import Axios from 'axios';
import Header from './header';

const CategoryContainer = () => {
  const { category } = useParams();
  const [newsData, setNewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const capitalizedCategory = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'News';

    Axios.get(`http://127.0.0.1:8000/api/category/${capitalizedCategory}/`)
      .then((response) => {
        setNewsData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching category news:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [category]);

  const catTitle = category ? category.toUpperCase() : 'NEWS';

  return (
    <>
      <Header activeContainer={1} />
      <Container fluid="lg" className="py-4">
        <div className="glass-card mb-4 p-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="badge bg-cyan text-dark fw-bold px-3 py-1 mb-2">CATEGORY EXPLORER</span>
              <h2 className="fw-extrabold mb-0" style={{ letterSpacing: '-0.5px' }}>
                {catTitle} Verification Feed
              </h2>
            </div>
            <span className="text-muted small fw-semibold">{newsData.length} Live Articles Scanned</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-cyan mb-3"></div>
            <div className="text-muted">Loading category articles...</div>
          </div>
        ) : newsData.length === 0 ? (
          <div className="glass-card text-center py-5">
            <p className="text-muted mb-0">No articles currently available in this category.</p>
          </div>
        ) : (
          <Row className="g-4">
            {newsData.map((news, idx) => {
              const isReal = news.prediction;
              const prob = news.real_probability || (isReal ? 90 : 10);
              const img = news.img_url && news.img_url !== 'None'
                ? news.img_url
                : `https://picsum.photos/seed/${idx + 100}/600/350`;

              return (
                <Col key={idx} xs={12} md={6} lg={4}>
                  <div className="glass-card glass-card-interactive h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="news-img-container">
                        <img src={img} alt={news.title} />
                        <div className="position-absolute top-0 start-0 m-2">
                          <span className="badge bg-dark text-info border border-secondary px-2 py-1 small">
                            <Tag className="me-1" /> {catTitle}
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
                            <Check2Circle size={16} /> REAL ({prob}%)
                          </div>
                        ) : (
                          <div className="badge-verdict badge-verdict-fake py-1 px-2" style={{ fontSize: '0.78rem' }}>
                            <XCircle size={16} /> FAKE ({100 - prob}%)
                          </div>
                        )}

                        <span className="text-muted small">
                          <Clock className="me-1" size={13} />
                          {news.publication_date ? new Date(news.publication_date).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <Button
                        variant="outline-info"
                        size="sm"
                        className="w-100 btn-glass-secondary py-1"
                        style={{ fontSize: '0.82rem' }}
                        onClick={() => setSelectedNews(news)}
                      >
                        <Cpu className="me-1" /> Rationale Breakdown
                      </Button>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      {/* Modal */}
      <Modal show={!!selectedNews} onHide={() => setSelectedNews(null)} centered size="lg" contentClassName="glass-card text-light border-0">
        {selectedNews && (
          <>
            <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
              <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                <Cpu color="#06b6d4" /> Verification Rationale
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h5 className="fw-bold mb-3">{selectedNews.title}</h5>
              <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <p className="mb-0 text-light small" style={{ lineHeight: '1.6' }}>
                  {selectedNews.summary || 'Verified using Naive Bayes TF-IDF Classifier & Linguistic Analysis.'}
                </p>
              </div>
            </Modal.Body>
          </>
        )}
      </Modal>
    </>
  );
};

export default CategoryContainer;
