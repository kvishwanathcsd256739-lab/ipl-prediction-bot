# Feature Engineering Guide — IPL Prediction ML Models

Explanation of all features used in the machine learning models.

## Table of Contents

- [Overview](#overview)
- [Team Statistics Features](#team-statistics-features)
- [Head-to-Head Features](#head-to-head-features)
- [Venue Features](#venue-features)
- [Player Performance Features](#player-performance-features)
- [Toss Features](#toss-features)
- [Feature Importance](#feature-importance)
- [Adding New Features](#adding-new-features)

---

## Overview

The ML models use **18 engineered features** derived from raw CSV data. Features are grouped into five categories:

| Category | Feature Count | Source |
|----------|--------------|--------|
| Team Statistics | 6 per team (12 total) | `matches.csv`, `batters.csv`, `bowlers.csv` |
| Head-to-Head | 3 | `matches.csv` |
| Venue | 2 | `matches.csv` |
| Total | ~17–20 | Combined |

All features are **numerical** (categorical features are encoded or dropped for the base model).

---

## Team Statistics Features

Computed for **both teams** — each feature appears twice (prefixed with `team1_` and `team2_`).

### `team_wins`

**Description:** Total number of wins in the current season (2025).

**Formula:**
```python
wins = count(matches where match_winner == team)
```

**Range:** 0–14 (typical for IPL season)

**Importance:** Higher wins indicates better overall form.

---

### `team_matches`

**Description:** Total matches played in the current season.

**Formula:**
```python
matches = count(matches where team1 == team OR team2 == team)
```

**Range:** 0–16

---

### `team_win_pct`

**Description:** Win percentage — proportion of matches won.

**Formula:**
```python
win_pct = wins / matches_played  # 0.0 to 1.0
```

**Example:** Team with 9 wins from 14 matches = 0.643 (64.3%)

**Importance:** Most important team performance metric.

---

### `team_avg_runs`

**Description:** Average runs scored per match by team batters.

**Formula:**
```python
avg_runs = batters_df[batters_df.Team == team]['Runs'].mean()
```

**Range:** Typically 25–60 runs per player

**Importance:** Measures batting firepower.

---

### `team_avg_sr`

**Description:** Average batting strike rate of team batters.

**Formula:**
```python
avg_sr = batters_df[batters_df.Team == team]['Strike_rate'].mean()
```

**Range:** Typically 120–160

**Importance:** Higher strike rate = more aggressive batting = higher scores.

---

### `team_avg_economy`

**Description:** Average bowling economy rate (runs per over).

**Formula:**
```python
avg_economy = bowlers_df[bowlers_df.Team == team]['Economy_rate'].mean()
```

**Range:** Typically 7.0–10.0

**Importance:** Lower economy = better bowling = opponent scores less.

---

## Head-to-Head Features

Historical record between the two specific teams.

### `h2h_team1_wins`

**Description:** Number of times Team 1 has beaten Team 2 historically.

**Formula:**
```python
h2h_team1_wins = count(matches where (team1==T1 AND team2==T2 AND winner==T1)
                       OR (team1==T2 AND team2==T1 AND winner==T1))
```

---

### `h2h_team2_wins`

**Description:** Number of times Team 2 has beaten Team 1 historically.

Same formula as above but for Team 2.

---

### `h2h_total`

**Description:** Total matches played between the two teams.

**Formula:**
```python
h2h_total = h2h_team1_wins + h2h_team2_wins + draws
```

**Importance:** More matches = more reliable H2H statistics.

---

## Venue Features

Describes the match location characteristics.

### `venue_avg_score`

**Description:** Average total score (both innings combined / 2) at this venue.

**Formula:**
```python
venue_matches = matches[matches.venue == venue]
avg_score = (sum(first_ings_score) + sum(second_ings_score)) / (len(venue_matches) * 2)
```

**Range:** Typically 150–190 runs

**Interpretation:**
- > 180 = High-scoring venue (batting friendly)
- < 155 = Low-scoring venue (bowling friendly)

---

### `venue_matches`

**Description:** Total IPL matches played at this venue (data quality indicator).

**Range:** 0–30+

**Importance:** Low values (< 5) mean venue statistics are unreliable.

---

## Player Performance Features

These features reflect individual star players' form.

### Batting Features (from `IPL2025Batters.csv`)

| Raw Column | Description | Used As |
|------------|-------------|---------|
| `Runs` | Total runs scored | Input to `avg_runs` |
| `Strike_rate` | Strike rate | Input to `avg_sr` |
| `Average` | Batting average | Additional feature (optional) |
| `Fours` | Boundary count | Additional feature (optional) |
| `Sixes` | Six count | Additional feature (optional) |

### Bowling Features (from `IPL2025Bowlers.csv`)

| Raw Column | Description | Used As |
|------------|-------------|---------|
| `Economy_rate` | Economy rate | Input to `avg_economy` |
| `Wickets` | Total wickets | Additional feature (optional) |
| `Average` | Bowling average | Additional feature (optional) |
| `Strike_rate` | Bowling strike rate | Additional feature (optional) |

---

## Toss Features

### `toss_winner`

**Description:** Which team won the toss (categorical).

**Encoding:** 1 if Team 1 won toss, 0 if Team 2 won toss.

### `toss_decision`

**Description:** Whether the toss winner chose to bat or field.

**Encoding:** 1 = bat, 0 = field

**Note:** Toss features are available for historical data but must be predicted/excluded for future matches.

---

## Feature Importance

Based on Random Forest feature importance analysis:

| Rank | Feature | Importance Score | Category |
|------|---------|-----------------|---------|
| 1 | `team1_win_pct` | ~0.18 | Team stats |
| 2 | `team2_win_pct` | ~0.17 | Team stats |
| 3 | `h2h_team1_wins` | ~0.12 | Head-to-head |
| 4 | `team1_avg_economy` | ~0.10 | Team stats |
| 5 | `team2_avg_economy` | ~0.09 | Team stats |
| 6 | `venue_avg_score` | ~0.08 | Venue |
| 7 | `team1_avg_sr` | ~0.07 | Team stats |
| 8 | `team2_avg_sr` | ~0.07 | Team stats |
| 9 | `h2h_total` | ~0.06 | Head-to-head |
| 10 | Others | ~0.06 | Various |

*Scores are approximate and vary by season data.*

---

## Adding New Features

### Recommended Additional Features

#### 1. Recent Form (Last 5 Matches)

```python
def get_recent_form(team, n=5):
    team_matches = matches[
        (matches.team1 == team) | (matches.team2 == team)
    ].tail(n)
    wins = len(team_matches[team_matches.match_winner == team])
    return wins / n  # 0.0 to 1.0
```

#### 2. Home/Away Advantage

```python
def get_home_advantage(team, venue):
    home_matches = matches[
        ((matches.team1 == team) | (matches.team2 == team)) &
        (matches.venue == venue)
    ]
    home_wins = len(home_matches[home_matches.match_winner == team])
    return home_wins / len(home_matches) if len(home_matches) > 0 else 0.5
```

#### 3. Player Availability (Injury/Squad)

```python
# Binary flag: key player available
is_key_player_available = 1  # 0 if injured/suspended
```

### Adding a Feature

1. Add the calculation to `DataProcessor.engineer_features()` in `src/data_processor.py`
2. Ensure the feature returns a numeric value (no strings)
3. Handle missing data with `.fillna(0)` or a sensible default
4. Retrain models: `python src/main.py`
5. Evaluate if the new feature improves accuracy

### Feature Validation

```python
# Check for null values
print(features_df.isnull().sum())

# Check feature distributions
print(features_df.describe())

# Check correlation with target
print(features_df.corrwith(target).sort_values(ascending=False))
```
