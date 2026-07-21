# 📊 Veri-News AI Dataset

This directory contains the training and evaluation dataset for the **Fake News Detector** Machine Learning and NLP models.

## 📁 File Structure

* `fake_news_dataset.csv`: Main dataset file containing news articles with binary labels (`0` = Real News, `1` = Fake News).

---

## 📋 Schema Description

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `title` | String | Headline / Title of the news article |
| `text` | String | Full text body of the news article |
| `label` | Integer | Binary classification target (`0`: Real News, `1`: Fake News) |

---

## 📊 Dataset Statistics & Classes

- **Total Samples:** 6,200+ articles
- **Class 0 (Real News):** Verified articles from authentic news agencies (Reuters, BBC, AP, Guardian, Official Publications).
- **Class 1 (Fake News):** Unverified rumors, clickbait headlines, and satirical/hoax articles.

---

## 🛠️ Usage in Project

1. **Database Quiz Data Loader:**
   ```bash
   cd app/FakeNewsDetectorAPI
   python manage.py quiz_data_loader game_data/game_data.csv
   ```

2. **Model Training (Jupyter Notebook):**
   Refer to `FakeNewsDetection_AIProject.ipynb` for EDA, TF-IDF Vectorization, Naive Bayes, and Model Evaluation.
