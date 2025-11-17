/**
 * Quick script to create a test EEG session for ESP32 photo linking
 * This creates a session so ESP32 photos have something to link to
 * 
 * Usage: node create_test_session.js <userId>
 * Example: node create_test_session.js 668877e8a93e5e40854c6012
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// EEG Session Schema (inline for convenience)
const eegSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      enum: ["Positif", "Netral", "Negatif"],
      required: true,
    },
    probabilities: {
      type: [Number],
      default: [],
    },
    note: {
      type: String,
      default: "",
    },
    photoPath: {
      type: String,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

const EEGSession = mongoose.models.EEGSession || 
  mongoose.model("EEGSession", eegSessionSchema);

async function createTestSession(userId) {
  try {
    console.log('\n🔧 Creating test EEG session...\n');
    console.log('MongoDB URI:', process.env.MONGO_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
    console.log('User ID:', userId);
    console.log('');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create a test session with neutral mood
    const testSession = await EEGSession.create({
      userId: userId,
      mood: "Netral",
      probabilities: [0.3, 0.4, 0.3], // Negatif, Netral, Positif
      note: "Test session for ESP32-CAM integration",
      photoPath: null,
    });

    console.log('✅ Test session created successfully!\n');
    console.log('Session Details:');
    console.log('─────────────────────────────────────────');
    console.log('Session ID:', testSession._id.toString());
    console.log('User ID:', testSession.userId.toString());
    console.log('Mood:', testSession.mood);
    console.log('Created:', testSession.createdAt.toISOString());
    console.log('─────────────────────────────────────────\n');
    
    console.log('🎉 Now your ESP32-CAM can upload photos!\n');
    console.log('Photos will be linked to this session.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.name === 'ValidationError') {
      console.log('\n💡 Tip: Make sure the userId is a valid MongoDB ObjectId (24 hex characters)');
    } else if (error.name === 'MongooseError') {
      console.log('\n💡 Tip: Check your MONGO_URI in .env file');
    }
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Get userId from command line argument
const userId = process.argv[2] || '668877e8a93e5e40854c6012';

if (userId.length !== 24) {
  console.error('\n❌ Invalid User ID!');
  console.log('User ID must be exactly 24 characters (MongoDB ObjectId format)');
  console.log('\nUsage: node create_test_session.js <userId>');
  console.log('Example: node create_test_session.js 668877e8a93e5e40854c6012\n');
  process.exit(1);
}

createTestSession(userId);
