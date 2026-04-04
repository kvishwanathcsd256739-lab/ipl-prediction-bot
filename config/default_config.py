"""
Default Configuration Settings — IPL Prediction Bot (Python ML Pipeline)
=========================================================================
Centralizes all configuration values for the ML prediction components.

Usage:
    from config.default_config import Config

    config = Config()
    print(config.DATA_PATH)
"""

import os
from pathlib import Path

# Base directory (project root)
BASE_DIR = Path(__file__).resolve().parent.parent


class Config:
    """Default configuration settings for the IPL ML prediction pipeline."""

    # -------------------------------------------------------
    # Paths
    # -------------------------------------------------------
    BASE_DIR = BASE_DIR
    DATA_PATH = str(BASE_DIR / "data")
    MODELS_PATH = str(BASE_DIR / "models")
    PREDICTIONS_PATH = str(BASE_DIR / "predictions")

    # -------------------------------------------------------
    # Data Files
    # -------------------------------------------------------
    MATCHES_FILE = "matches.csv"
    BATTERS_FILE = "IPL2025Batters.csv"
    BOWLERS_FILE = "IPL2025Bowlers.csv"
    SCHEDULE_FILE = "ipl-2026-UTC.csv"
    AUCTION_FILE = "IPL_Mini_Auction_2026.csv"
    ORANGE_CAP_FILE = "orange_cap.csv"
    PURPLE_CAP_FILE = "purple_cap.csv"

    # -------------------------------------------------------
    # Model Configuration
    # -------------------------------------------------------

    # Random Forest
    RF_N_ESTIMATORS = 100
    RF_MAX_DEPTH = 15
    RF_MIN_SAMPLES_SPLIT = 5
    RF_RANDOM_STATE = 42

    # XGBoost
    XGB_N_ESTIMATORS = 100
    XGB_MAX_DEPTH = 7
    XGB_LEARNING_RATE = 0.1
    XGB_RANDOM_STATE = 42

    # Neural Network
    NN_EPOCHS = 50
    NN_BATCH_SIZE = 32
    NN_HIDDEN_LAYERS = [128, 64, 32]
    NN_DROPOUT_RATE = 0.3

    # -------------------------------------------------------
    # Training Configuration
    # -------------------------------------------------------
    TEST_SIZE = 0.2               # 20% test split
    RANDOM_STATE = 42             # Global random seed
    CROSS_VAL_FOLDS = 5           # K-fold cross validation

    # -------------------------------------------------------
    # Feature Engineering
    # -------------------------------------------------------
    FORM_WINDOW = 5               # Number of recent matches for form calculation
    MIN_MATCHES_FOR_STATS = 3     # Minimum matches for reliable statistics
    DEFAULT_WIN_PCT = 0.5         # Default win percentage when no data
    DEFAULT_AVG_SCORE = 170       # Default venue average score

    # -------------------------------------------------------
    # IPL Teams
    # -------------------------------------------------------
    IPL_TEAMS = [
        "CSK",   # Chennai Super Kings
        "MI",    # Mumbai Indians
        "RCB",   # Royal Challengers Bengaluru
        "DC",    # Delhi Capitals
        "KKR",   # Kolkata Knight Riders
        "PBKS",  # Punjab Kings
        "RR",    # Rajasthan Royals
        "SRH",   # Sunrisers Hyderabad
        "GT",    # Gujarat Titans
        "LSG",   # Lucknow Super Giants
    ]

    # -------------------------------------------------------
    # IPL Venues
    # -------------------------------------------------------
    VENUES = {
        "CSK": "Chennai",
        "MI": "Mumbai",
        "RCB": "Bangalore",
        "DC": "Delhi",
        "KKR": "Kolkata",
        "PBKS": "Mohali",
        "RR": "Jaipur",
        "SRH": "Hyderabad",
        "GT": "Ahmedabad",
        "LSG": "Lucknow",
    }

    # -------------------------------------------------------
    # Prediction Output
    # -------------------------------------------------------
    PREDICTIONS_FILE = "ipl_2026_predictions.csv"
    CONFIDENCE_LOW = 0.60         # Below this: low confidence
    CONFIDENCE_HIGH = 0.75        # Above this: high confidence

    # -------------------------------------------------------
    # Logging
    # -------------------------------------------------------
    LOG_LEVEL = "INFO"
    LOG_FILE = str(BASE_DIR / "logs" / "ml_pipeline.log")

    def __init__(self):
        """Create required directories on initialization."""
        os.makedirs(self.DATA_PATH, exist_ok=True)
        os.makedirs(self.MODELS_PATH, exist_ok=True)
        os.makedirs(self.PREDICTIONS_PATH, exist_ok=True)

    def get_data_file(self, filename: str) -> str:
        """Get full path to a data file."""
        return os.path.join(self.DATA_PATH, filename)

    def get_model_file(self, filename: str) -> str:
        """Get full path to a model file."""
        return os.path.join(self.MODELS_PATH, filename)

    def get_predictions_file(self) -> str:
        """Get full path to predictions output file."""
        return os.path.join(self.PREDICTIONS_PATH, self.PREDICTIONS_FILE)

    def __repr__(self) -> str:
        return (
            f"Config(data_path={self.DATA_PATH!r}, "
            f"models_path={self.MODELS_PATH!r}, "
            f"teams={len(self.IPL_TEAMS)})"
        )


# Singleton instance for easy import
config = Config()
