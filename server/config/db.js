import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/store.json');

export let isUsingMongo = false;

// Embedded persistent datastore for seamless execution
class LocalStore {
  constructor() {
    this.data = {
      users: [],
      profiles: [],
      organizations: [],
      opportunities: [],
      assistanceRequests: [],
      projects: [],
      applications: [],
      communities: [],
      communityMembers: [],
      communityPosts: [],
      messages: [],
      notifications: [],
      resources: [],
      reports: []
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(path.dirname(DATA_FILE))) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        if (raw.trim()) {
          this.data = { ...this.data, ...JSON.parse(raw) };
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Error initializing LocalStore, using in-memory state:', err.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving LocalStore:', err.message);
    }
  }

  getCollection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name];
  }
}

export const localStore = new LocalStore();

// Generate MongoDB-like 24 hex char ID
export const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return (timestamp + random).substring(0, 24);
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/linkup');
  if (!uri) throw new Error('MONGODB_URI is required in production');
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isUsingMongo = true;
    console.log('[MongoDB] Connected successfully to MongoDB instance.');
  } catch (err) {
    isUsingMongo = false;
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MongoDB connection failed; refusing to start without persistent production storage', { cause: err });
    }
    console.log('[MongoDB] No local MongoDB server found. Using the local JSON datastore for development.');
  }
};
