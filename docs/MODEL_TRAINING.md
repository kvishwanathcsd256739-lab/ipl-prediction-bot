# Model Training Guide — IPL Prediction ML Pipeline

Technical guide for training, evaluating, and deploying the machine learning models.

> **Note:** This guide covers the optional Python ML pipeline for automated predictions.
> The primary bot uses manually curated admin predictions.
> The ML pipeline enhances predictions with data-driven analysis.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Data Requirements](#data-requirements)
- [Training Pipeline](#training-pipeline)
- [Model Details](#model-details)
- [Hyperparameter Tuning](#hyperparameter-tuning)
- [Evaluation Metrics](#evaluation-metrics)
- [Retraining Schedule](#retraining-schedule)

---

## Overview

The ML pipeline uses historical IPL data to train ensemble models that predict:

1. **Match Winner** — Which team wins (classification)
2. **Match Scores** — Expected runs scored (regression)
3. **Winning Margin** — By how many runs/wickets (regression)

### Model Architecture

```
Historical Data → Feature Engineering → Model Training → Ensemble → Predictions
     │                    │                   │             │
  CSV files          DataProcessor      RF + XGB + NN   Combined
  6 datasets         statistics         3 models        output
```

---

## Prerequisites

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Required packages:
- `pandas` — Data manipulation
- `numpy` — Numerical computing
- `scikit-learn` — Random Forest, preprocessing
- `xgboost` — Gradient boosting
- `tensorflow` — Neural network
- `joblib` — Model persistence
- `matplotlib`, `seaborn` — Visualization

---

## Data Requirements

Place the following CSV files in the `data/` directory:

### Required Files

| File | Description | Key Columns |
|------|-------------|-------------|
| `matches.csv` | Historical match results | `match_id`, `team1`, `team2`, `venue`, `match_winner`, `toss_winner`, `toss_decision`, `first_ings_score`, `second_ings_score` |
| `IPL2025Batters.csv` | Batting statistics | `Player Name`, `Team`, `Runs`, `Strike_rate`, `Average` |
| `IPL2025Bowlers.csv` | Bowling statistics | `Player Name`, `Team`, `Wickets`, `Economy_rate`, `Average` |
| `ipl-2026-UTC.csv` | 2026 match schedule | `Match Number`, `Home Team`, `Away Team`, `Location`, `Date` |
| `IPL_Mini_Auction_2026.csv` | 2026 auction data | `Player`, `Team`, `Price`, `Role` |
| `orange_cap.csv` | Top batters | `Player`, `Team`, `Runs` |
| `purple_cap.csv` | Top bowlers | `Player`, `Team`, `Wickets` |

### Data Quality Requirements

- Minimum 50 historical matches for reliable training
- No empty `match_winner` column entries
- Consistent team name abbreviations throughout
- Date format: `DD/MM/YYYY` or ISO 8601

---

## Training Pipeline

### Step 1: Run Training Script

```bash
cd ipl-prediction-bot
python src/main.py
```

Expected output:
```
🚀 IPL Prediction Bot - Training Pipeline
==================================================
🔄 Loading datasets...
✅ All datasets loaded successfully!
🔨 Engineering features...
✅ Features created: 74 matches × 18 features
🌳 Training Random Forest...
✅ Random Forest trained - Accuracy: 87.84%
⚡ Training XGBoost...
✅ XGBoost trained - Accuracy: 90.54%
🧠 Training Neural Network...
✅ Neural Network trained - Accuracy: 86.49%
📊 Training Score Regressor...
✅ Score Regressor trained
✅ Models saved successfully!
==================================================
✅ Pipeline Complete!
📊 Generated predictions for 70 matches
💾 Saved to: predictions/ipl_2026_predictions.csv
```

### Step 2: View Predictions

```bash
# View first 10 predictions
head -11 predictions/ipl_2026_predictions.csv
```

### Step 3: Validate Results

```bash
python -c "
import pandas as pd
df = pd.read_csv('predictions/ipl_2026_predictions.csv')
print(f'Total predictions: {len(df)}')
print(f'Avg confidence: {df[\"confidence\"].mean():.2%}')
print(df[['date', 'team1', 'team2', 'predicted_winner', 'confidence']].head(10))
"
```

---

## Model Details

### 1. Random Forest Classifier

**Purpose:** Match winner prediction

**Configuration:**
```python
RandomForestClassifier(
    n_estimators=100,      # Number of trees
    max_depth=15,          # Maximum tree depth
    min_samples_split=5,   # Min samples to split a node
    random_state=42,       # Reproducibility seed
    n_jobs=-1              # Use all CPU cores
)
```

**Strengths:**
- Handles non-linear relationships
- Robust to outliers
- Provides feature importance

---

### 2. XGBoost Classifier

**Purpose:** Winner prediction with higher accuracy

**Configuration:**
```python
XGBClassifier(
    n_estimators=100,      # Boosting rounds
    max_depth=7,           # Tree depth
    learning_rate=0.1,     # Step size
    random_state=42,
    verbosity=0
)
```

**Strengths:**
- Often highest accuracy
- Handles missing values
- Built-in regularization

---

### 3. Neural Network

**Purpose:** Complex pattern recognition

**Architecture:**
```
Input (18 features)
     │
Dense(128, relu) → Dropout(0.3)
     │
Dense(64, relu)  → Dropout(0.3)
     │
Dense(32, relu)
     │
Dense(1, sigmoid) → Output [0-1]
```

**Training configuration:**
```python
optimizer='adam'
loss='binary_crossentropy'
epochs=50
batch_size=32
```

---

### 4. Ensemble Model

**Purpose:** Combine all three models for best accuracy

**Method:** Simple average of predicted probabilities
```python
ensemble_prob = (rf_prob + xgb_prob + nn_prob) / 3
winner = team1 if ensemble_prob > 0.5 else team2
confidence = max(ensemble_prob, 1 - ensemble_prob)
```

---

## Hyperparameter Tuning

### Random Forest Tuning

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'n_estimators': [100, 200, 300],
    'max_depth': [10, 15, 20, None],
    'min_samples_split': [2, 5, 10],
}

grid_search = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)
grid_search.fit(X_train, y_train)
print(f"Best params: {grid_search.best_params_}")
print(f"Best CV accuracy: {grid_search.best_score_:.2%}")
```

### XGBoost Tuning

```python
param_grid = {
    'n_estimators': [100, 200],
    'max_depth': [5, 7, 9],
    'learning_rate': [0.05, 0.1, 0.2],
    'subsample': [0.8, 1.0]
}

grid_search = GridSearchCV(XGBClassifier(verbosity=0), param_grid, cv=5)
grid_search.fit(X_train, y_train)
```

---

## Evaluation Metrics

### Classification Metrics (Winner Prediction)

| Metric | Target | Formula |
|--------|--------|---------|
| Accuracy | > 85% | Correct predictions / Total |
| Precision | > 0.83 | TP / (TP + FP) |
| Recall | > 0.83 | TP / (TP + FN) |
| F1-Score | > 0.83 | 2 × (P × R) / (P + R) |

### Regression Metrics (Score Prediction)

| Metric | Target | Formula |
|--------|--------|---------|
| MAE | < 15 runs | Mean Absolute Error |
| RMSE | < 20 runs | Root Mean Squared Error |
| R² | > 0.75 | Coefficient of determination |

### Evaluating Models

```python
from sklearn.model_selection import cross_val_score

# 5-fold cross validation
cv_scores = cross_val_score(rf_classifier, X, y, cv=5, scoring='accuracy')
print(f"CV Accuracy: {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")
```

---

## Retraining Schedule

| Trigger | Frequency | Notes |
|---------|-----------|-------|
| New season data | Annually (Feb-Mar) | Before IPL season starts |
| Mid-season update | After 30+ matches | If early predictions are off |
| Player transfers | After auction | Update team rosters |
| Performance degradation | When accuracy drops > 5% | Monitor prediction accuracy |

### Retraining Steps

1. Add new match data to `data/matches.csv`
2. Update player statistics files
3. Run training pipeline: `python src/main.py`
4. Compare new model performance to old
5. If improved, replace models in `models/` directory
6. Update predictions CSV

```bash
# Compare old vs new model accuracy
python -c "
import joblib
from sklearn.metrics import accuracy_score
# Load old and new models, compare on holdout set
"
```
