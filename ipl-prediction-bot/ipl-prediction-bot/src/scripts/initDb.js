require('dotenv').config();
const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');

async function initDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Create sample prediction
    const samplePrediction = new Prediction({
      matchDate: new Date('2026-04-15'),
      team1: 'CSK',
      team2: 'RCB',
      premium: {
        winner: 'CSK',
        tossWinner: 'RCB',
        keyPlayer: 'MS Dhoni',
        confidence: 85,
        additionalNotes: 'CSK has strong spin attack and plays well at home'
      },
      freeAnalysis: {
        team1Form: ['W', 'L', 'W', 'W', 'L'],
        team2Form: ['L', 'L', 'W', 'L', 'W'],
        team1Players: [
          { name: 'Ruturaj Gaikwad', role: 'Batsman', form: 'Scoring runs regularly' },
          { name: 'Shivam Dube', role: 'All-rounder', form: 'Hitting big sixes' },
          { name: 'Ravindra Jadeja', role: 'All-rounder', form: 'Good all-rounder' }
        ],
        team2Players: [
          { name: 'Virat Kohli', role: 'Batsman', form: 'Very consistent' },
          { name: 'Faf du Plessis', role: 'Batsman', form: 'Decent form' },
          { name: 'Glenn Maxwell', role: 'All-rounder', form: 'Risky player' }
        ],
        pitchReport: {
          type: 'Pitch is good for batting, ball comes nicely on bat',
          battingFriendly: true,
          spinnerFriendly: true
        },
        weather: {
          condition: 'Clear weather, no rain expected',
          rainChance: 0
        },
        headToHead: {
          totalMatches: 30,
          team1Wins: 19,
          team2Wins: 11
        },
        venueAdvantage: 'CSK plays strong at this ground, RCB average performance',
        tossTrend: 'Teams prefer chasing, Toss not very important - 50-50 chance',
        teamStrength: {
          batting: 'RCB',
          bowling: 'CSK',
          balance: 'CSK'
        },
        starPlayers: [
          'Virat Kohli',
          'Ruturaj Gaikwad',
          'Shivam Dube',
          'Glenn Maxwell',
          'Ravindra Jadeja',
          'MS Dhoni'
        ],
        playerPredictions: [
          'Kohli may score 40+ runs',
          'Ruturaj may score 30+ runs',
          'Dube may hit 2+ sixes',
          'Maxwell may score big or fail',
          'Jadeja may take 1-2 wickets',
          'Siraj may take 2 wickets'
        ],
        milestones: [
          'Kohli can score a half-century',
          'Dhoni can hit finishing sixes',
          'Jadeja can reach wicket milestone',
          'Ruturaj can increase season runs'
        ],
        matchFlowPredictions: [
          'Powerplay score: 50-60 runs',
          'Total score: 170-190',
          'High scoring match likely',
          'Chasing team advantage',
          'Match may go till last over'
        ],
        riskFactors: [
          'RCB middle order collapse possible',
          'CSK death bowling risk',
          'Maxwell unpredictable',
          'Surprise player may perform'
        ],
        teamInsights: [
          'CSK balanced team',
          'RCB depends on top order',
          'CSK spin strong',
          'RCB pace strong'
        ],
        bonusInsights: [
          'Early wickets will change game',
          'Dew may affect second innings',
          'Captain decisions are important',
          'Fielding mistakes can change match',
          'One over can decide match'
        ]
      },
      active: true,
      createdBy: parseInt(process.env.ADMIN_USER_ID)
    });

    await samplePrediction.save();
    console.log('✅ Sample prediction created');

    console.log('\n📊 Sample Data:');
    console.log('Match: CSK vs RCB');
    console.log('Date: 2026-04-15');
    console.log('Winner: CSK (85% confidence)');

    await mongoose.disconnect();
    console.log('\n✅ Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
