import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Header from './header';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { 
  Trophy, Fire, Check2Circle, XCircle, ArrowRight, Lightbulb, ArrowClockwise 
} from 'react-bootstrap-icons';

function NewsQuiz() {
  document.title = 'AI News Quiz | Veri-News AI';

  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // 'True' (Real) or 'False' (Fake)
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('veri_news_high_score') || '0', 10);
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizQuestion = () => {
    setIsLoading(true);
    setSelectedOption(null);
    setHasSubmitted(false);
    setFeedbackResult(null);

    Axios.get('http://127.0.0.1:8000/api/quiz/')
      .then((response) => {
        setCurrentQuiz(response.data);
      })
      .catch((error) => {
        console.error('Error fetching quiz data:', error);
        toast.error('Failed to load quiz question.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchQuizQuestion();
  }, []);

  const handleSubmitAnswer = () => {
    if (!selectedOption) {
      toast.error('Please select whether you think this news is Real or Fake!');
      return;
    }

    if (!currentQuiz) return;

    const userBool = selectedOption === 'True';

    Axios.post('http://127.0.0.1:8000/api/quiz/', {
      id: currentQuiz.id,
      answer: userBool
    })
      .then((response) => {
        setHasSubmitted(true);
        setFeedbackResult(response.data);

        if (response.data.result) {
          const newScore = score + 100 + streak * 20;
          const newStreak = streak + 1;
          setScore(newScore);
          setStreak(newStreak);

          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('veri_news_high_score', newScore.toString());
          }

          toast.success('🎯 Correct prediction! Great eye!');
        } else {
          setStreak(0);
          toast.error('❌ Incorrect! That news was ' + (response.data.correct_answer ? 'REAL' : 'FAKE'));
        }
      })
      .catch((error) => {
        console.error('Error checking quiz answer:', error);
        toast.error('Error validating answer.');
      });
  };

  return (
    <>
      <Header activeContainer={3} />
      <Container fluid="lg" className="py-4">
        {/* Quiz Header & Stats */}
        <Row className="mb-4">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="fw-extrabold mb-2" style={{ fontSize: '2.2rem' }}>
              <Trophy className="text-warning me-2" color="#f59e0b" />
              AI Fake News Detective Quiz
            </h2>
            <p className="text-muted">
              Test your ability to spot misinformation vs genuine reporting. Earn points & build your streak!
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={9}>
            {/* Scoreboard Bar */}
            <div className="glass-card mb-4 p-3">
              <Row className="text-center g-3 align-items-center">
                <Col xs={4}>
                  <div className="text-muted small fw-bold text-uppercase">Score</div>
                  <div className="fw-extrabold text-cyan" style={{ fontSize: '1.5rem' }}>{score}</div>
                </Col>
                <Col xs={4} className="border-start border-end border-secondary border-opacity-25">
                  <div className="text-muted small fw-bold text-uppercase">Current Streak</div>
                  <div className="fw-extrabold text-warning d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '1.5rem' }}>
                    <Fire color="#f59e0b" /> {streak}
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="text-muted small fw-bold text-uppercase">High Score</div>
                  <div className="fw-extrabold text-success" style={{ fontSize: '1.5rem' }}>{highScore}</div>
                </Col>
              </Row>
            </div>

            {/* Quiz Question Card */}
            {isLoading ? (
              <div className="glass-card text-center py-5">
                <div className="spinner-border text-warning mb-3"></div>
                <div className="text-muted fw-semibold">Loading next news mystery...</div>
              </div>
            ) : currentQuiz ? (
              <div className="glass-card mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-secondary text-light px-3 py-1">QUESTION ITEM</span>
                  {currentQuiz.ai_real_probability && (
                    <span className="text-muted small">
                      AI Baseline Probability: <strong className="text-cyan">{currentQuiz.ai_real_probability}% Real</strong>
                    </span>
                  )}
                </div>

                <h4 className="fw-bold text-light mb-3" style={{ lineHeight: '1.4' }}>
                  "{currentQuiz.news_title}"
                </h4>

                {currentQuiz.news_description && (
                  <p className="text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                    {currentQuiz.news_description}
                  </p>
                )}

                {/* Options Selection */}
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <div
                      className={`quiz-option-card ${selectedOption === 'True' ? 'selected-real' : ''}`}
                      onClick={() => !hasSubmitted && setSelectedOption('True')}
                    >
                      <Check2Circle size={32} color={selectedOption === 'True' ? '#10b981' : '#94a3b8'} />
                      <div>
                        <div className="fw-bold text-light">Real News</div>
                        <div className="text-muted small">Genuine article from verified journalism</div>
                      </div>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div
                      className={`quiz-option-card ${selectedOption === 'False' ? 'selected-fake' : ''}`}
                      onClick={() => !hasSubmitted && setSelectedOption('False')}
                    >
                      <XCircle size={32} color={selectedOption === 'False' ? '#ef4444' : '#94a3b8'} />
                      <div>
                        <div className="fw-bold text-light">Fake News</div>
                        <div className="text-muted small">Fabricated, misleading, or clickbait content</div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Action Buttons */}
                {!hasSubmitted ? (
                  <Button
                    variant="cyan"
                    className="btn-cyan w-100 py-3 fw-bold"
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                  >
                    Submit My Answer <ArrowRight className="ms-2" />
                  </Button>
                ) : (
                  <div>
                    {/* Feedback box */}
                    <div
                      className="p-4 rounded-3 mb-3"
                      style={{
                        background: feedbackResult?.result ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: feedbackResult?.result ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {feedbackResult?.result ? (
                          <span className="badge bg-success text-white fw-bold px-3 py-2">
                            🎉 CORRECT PREDICTION! (+{100 + (streak - 1) * 20} pts)
                          </span>
                        ) : (
                          <span className="badge bg-danger text-white fw-bold px-3 py-2">
                            ❌ INCORRECT!
                          </span>
                        )}
                        <span className="text-light fw-bold">
                          Actual Status: {feedbackResult?.verdict_text}
                        </span>
                      </div>

                      <div className="small text-light mt-2">
                        <Lightbulb className="text-warning me-1" /> <strong>Explanation:</strong>{' '}
                        {feedbackResult?.explanation}
                      </div>
                    </div>

                    <Button variant="cyan" className="btn-cyan w-100 py-3 fw-bold" onClick={fetchQuizQuestion}>
                      Next Question <ArrowClockwise className="ms-2" />
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </Col>
        </Row>
      </Container>
      <ToastContainer position="bottom-right" theme="dark" />
    </>
  );
}

export default NewsQuiz;
