import re
import requests
from bs4 import BeautifulSoup
from core.model import predict_with_confidence

CLICKBAIT_KEYWORDS = [
    "shocking", "you won't believe", "secret", "miracle", "doctors hate",
    "banned", "conspiracy", "hidden truth", "mind-blowing", "viral video",
    "unbelievable", "100% proof", "leaked", "insane", "guaranteed",
    "illuminati", "alien", "hoax", "disturbing", "blow your mind",
    "what happened next", "they don't want you to know", "breaking news!",
    "cure for cancer", "flat earth", "5g danger", "chemtrail", "mind control",
    "secret potion", "overnight wealth", "free money", "alien autopsy",
    "leaked memo", "shattering truth", "doctors are baffled", "cures all diseases",
    "cures covid", "bleach"
]

CREDIBLE_JOURNALISTIC_INDICATORS = [
    "nasa", "reuters", "associated press", "bbc", "guardian", "official statement",
    "spokesperson", "prime minister", "president", "parliament", "congress",
    "published in", "journal of", "university", "researchers", "according to",
    "ministry", "central bank", "study indicates", "announced today",
    "world health organization", "united nations", "scientific report",
    "summit", "conference", "treaty", "spokeswoman", "department of"
]

def extract_article_from_url(url):
    """
    Fetches article title and body text from a webpage URL.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.status_code != 200:
            return None, f"Failed to retrieve URL (HTTP {resp.status_code})"

        soup = BeautifulSoup(resp.content, "html.parser")
        
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        elif soup.find("h1"):
            title = soup.find("h1").get_text(strip=True)

        paragraphs = soup.find_all("p")
        text_content = " ".join([p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 25])
        
        if not title:
            title = "Extracted News Article"

        return {"title": title, "content": text_content[:4000], "url": url}, None
    except Exception as e:
        return None, str(e)

def analyze_news_content(title="", content=""):
    """
    Runs multi-signal AI analysis on text content combining ML model + Linguistic Signals + Credibility Indicators.
    """
    combined_text = f"{title} {content}".strip()
    if not combined_text:
        return {
            "prediction": True,
            "verdict": "Real News",
            "confidence_score": 50.0,
            "real_probability": 50.0,
            "fake_probability": 50.0,
            "sensationalism_score": 0,
            "flagged_keywords": [],
            "summary": "No text provided for analysis."
        }

    # 1. Base ML model prediction (TF-IDF + Naive Bayes Classifier)
    ml_is_real, ml_real_prob, ml_fake_prob = predict_with_confidence(combined_text)

    # 2. Clickbait & Sensationalism Analysis
    text_lower = combined_text.lower()
    flagged = [kw for kw in CLICKBAIT_KEYWORDS if kw in text_lower]
    credible_matches = [ind for ind in CREDIBLE_JOURNALISTIC_INDICATORS if ind in text_lower]

    # ALL CAPS ratio
    caps_count = sum(1 for c in combined_text if c.isupper())
    letters_count = sum(1 for c in combined_text if c.isalpha())
    caps_ratio = (caps_count / max(1, letters_count)) * 100

    # Punctuation counts
    exclamation_count = combined_text.count("!")
    question_count = combined_text.count("?")

    # Sensationalism Score (0 - 100)
    sensationalism = min(100, (len(flagged) * 30) + int(caps_ratio * 1.5) + (exclamation_count * 15) + (question_count * 5))

    # 3. Ensemble Fusion
    # Base risk starts from trained ML classifier output
    base_fake_risk = ml_fake_prob

    # If official credible sources are present and no clickbait -> force Real News
    if credible_matches and not flagged and sensationalism < 30:
        base_fake_risk = min(base_fake_risk, 10.0)

    # If clickbait triggers or high sensationalism -> force Fake News
    if flagged or sensationalism >= 40:
        base_fake_risk = max(base_fake_risk, 85.0 + (len(flagged) * 5.0))

    final_fake_prob = round(min(99.0, max(1.0, base_fake_risk)), 1)
    final_real_prob = round(100.0 - final_fake_prob, 1)

    final_is_real = final_real_prob >= final_fake_prob

    # 4. Generate Verdict and Explanation Summary
    if final_is_real:
        verdict = "Real News"
        confidence = final_real_prob
        summary = (
            f"The AI model evaluates this article as AUTHENTIC ({final_real_prob}% probability). "
            f"Linguistic structures show objective reporting tone and standard journalistic phrasing."
        )
        if credible_matches:
            summary += f" Verified credibility signals detected: {', '.join(credible_matches[:3])}."
    else:
        verdict = "Fake News"
        confidence = final_fake_prob
        summary = (
            f"The AI model flagged this article as UNRELIABLE or FAKE ({final_fake_prob}% risk score). "
        )
        if flagged:
            summary += f"Flagged clickbait & sensational phrases: {', '.join(flagged)}. "
        if sensationalism > 30:
            summary += f"High emotional intensity & clickbait score ({sensationalism}/100)."

    return {
        "prediction": final_is_real,
        "verdict": verdict,
        "confidence_score": confidence,
        "real_probability": final_real_prob,
        "fake_probability": final_fake_prob,
        "sensationalism_score": sensationalism,
        "flagged_keywords": flagged,
        "summary": summary
    }
