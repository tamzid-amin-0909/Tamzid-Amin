import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let useFirestore = false;
let db: admin.firestore.Firestore | null = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
    
    db = admin.firestore(firebaseConfig.firestoreDatabaseId || undefined);
    useFirestore = true;
    console.log(`Firebase Admin initialized successfully with Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId || '(default)'}`);
  }
} catch (e: any) {
  console.error('Firebase Admin initialization failed, falling back to local DB:', e.message || e);
}

const file = 'database.json';

function loadLocalDB(): any {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({ users: {}, settings: {}, notices: [], content: {}, sessions: {} }));
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) || {};
  } catch (e) {
    return { users: {}, settings: {}, notices: [], content: {}, sessions: {} };
  }
}

function saveLocalDB(data: any): boolean {
  try {
    delete data.user;
    delete data.currentUser;
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, file);
    return true;
  } catch (e) {
    console.error('Error saving local DB:', e);
    return false;
  }
}

// Auto-seed Firestore on startup if Firestore is empty
export async function seedFirestoreIfNeeded() {
  if (!useFirestore || !db) return;
  try {
    const contentSnapshot = await db.collection('content').limit(1).get();
    if (contentSnapshot.empty) {
      console.log('Firestore is empty. Seeding from local database.json...');
      if (fs.existsSync(file)) {
        const local = loadLocalDB();
        
        // Seed settings
        if (local.settings) {
          await db.collection('config').doc('settings').set(local.settings);
          console.log('Seeded settings to Firestore');
        }
        
        // Seed notices
        if (local.notices) {
          await db.collection('config').doc('notices').set({ list: local.notices });
          console.log('Seeded notices to Firestore');
        }
        
        // Seed users
        if (local.users) {
          const batch = db.batch();
          for (const [userId, userData] of Object.entries(local.users)) {
            const docRef = db.collection('users').doc(userId);
            batch.set(docRef, userData as any);
          }
          await batch.commit();
          console.log(`Seeded ${Object.keys(local.users).length} users to Firestore`);
        }
        
        // Seed sessions
        if (local.sessions) {
          const batch = db.batch();
          for (const [tokenId, sessionData] of Object.entries(local.sessions)) {
            const docRef = db.collection('sessions').doc(tokenId);
            batch.set(docRef, sessionData as any);
          }
          await batch.commit();
          console.log(`Seeded sessions to Firestore`);
        }
        
        // Seed content (each top-level key as a document in content collection)
        if (local.content) {
          for (const [subjectId, subjectData] of Object.entries(local.content)) {
            await db.collection('content').doc(subjectId).set(subjectData as any);
            console.log(`Seeded content subject: ${subjectId}`);
          }
        }
        console.log('Firestore seeding completed successfully!');
      }
    }
  } catch (err) {
    console.error('Error seeding Firestore:', err);
  }
}

// Call seed block in background
if (useFirestore && db) {
  seedFirestoreIfNeeded().then(() => {
    console.log('Local to Firestore synchronization checked.');
  }).catch(err => {
    console.error('Error during Firestore sync checklist:', err);
  });
}

export async function getSettings(): Promise<any> {
  if (useFirestore && db) {
    try {
      const d = await db.collection('config').doc('settings').get();
      return d.exists ? d.data() : {};
    } catch (e: any) {
      console.warn('Firestore getSettings failed, falling back to local DB:', e.message || e);
    }
  }
  const local = loadLocalDB();
  return local.settings || {};
}

export async function getNotices(): Promise<any[]> {
  if (useFirestore && db) {
    try {
      const d = await db.collection('config').doc('notices').get();
      return d.exists ? (d.data()?.list || []) : [];
    } catch (e: any) {
      console.warn('Firestore getNotices failed, falling back to local DB:', e.message || e);
    }
  }
  const local = loadLocalDB();
  return local.notices || [];
}

export async function getUsers(): Promise<any> {
  if (useFirestore && db) {
    try {
      const snapshot = await db.collection('users').get();
      const users: any = {};
      snapshot.forEach(d => {
        users[d.id] = d.data();
      });
      return users;
    } catch (e: any) {
      console.warn('Firestore getUsers failed, falling back to local DB:', e.message || e);
    }
  }
  const local = loadLocalDB();
  return local.users || {};
}

export async function getSessions(): Promise<any> {
  if (useFirestore && db) {
    try {
      const snapshot = await db.collection('sessions').get();
      const sessions: any = {};
      snapshot.forEach(d => {
        sessions[d.id] = d.data();
      });
      return sessions;
    } catch (e: any) {
      console.warn('Firestore getSessions failed, falling back to local DB:', e.message || e);
    }
  }
  const local = loadLocalDB();
  return local.sessions || {};
}

export async function getContent(): Promise<any> {
  if (useFirestore && db) {
    try {
      const snapshot = await db.collection('content').get();
      const content: any = {};
      snapshot.forEach(d => {
        content[d.id] = d.data();
      });
      return content;
    } catch (e: any) {
      console.warn('Firestore getContent failed, falling back to local DB:', e.message || e);
    }
  }
  const local = loadLocalDB();
  return local.content || {};
}

export async function saveSettings(settings: any): Promise<void> {
  const local = loadLocalDB();
  local.settings = settings;
  saveLocalDB(local);

  if (useFirestore && db) {
    try {
      await db.collection('config').doc('settings').set(settings);
    } catch (e: any) {
      console.warn('Firestore saveSettings failed:', e.message || e);
    }
  }
}

export async function saveNotices(notices: any[]): Promise<void> {
  const local = loadLocalDB();
  local.notices = notices;
  saveLocalDB(local);

  if (useFirestore && db) {
    try {
      await db.collection('config').doc('notices').set({ list: notices });
    } catch (e: any) {
      console.warn('Firestore saveNotices failed:', e.message || e);
    }
  }
}

export async function saveUser(userId: string, data: any): Promise<void> {
  const local = loadLocalDB();
  if (!local.users) local.users = {};
  local.users[userId] = data;
  saveLocalDB(local);

  if (useFirestore && db) {
    try {
      await db.collection('users').doc(userId).set(data);
    } catch (e: any) {
      console.warn('Firestore saveUser failed:', e.message || e);
    }
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const local = loadLocalDB();
  if (local.users && local.users[userId]) {
    delete local.users[userId];
    if (local.sessions) {
      for (const token of Object.keys(local.sessions)) {
        if (local.sessions[token].userId === userId) {
          delete local.sessions[token];
        }
      }
    }
    saveLocalDB(local);
  }

  if (useFirestore && db) {
    try {
      await db.collection('users').doc(userId).delete();
      const sessionsSnapshot = await db.collection('sessions').get();
      const batch = db.batch();
      let hasDeletes = false;
      sessionsSnapshot.forEach(d => {
        if (d.data()?.userId === userId) {
          batch.delete(d.ref);
          hasDeletes = true;
        }
      });
      if (hasDeletes) {
        await batch.commit();
      }
    } catch (e: any) {
      console.warn('Firestore deleteUser failed:', e.message || e);
    }
  }
}

export async function saveSession(token: string, sessionData: any): Promise<void> {
  const local = loadLocalDB();
  if (!local.sessions) local.sessions = {};
  local.sessions[token] = sessionData;
  saveLocalDB(local);

  if (useFirestore && db) {
    try {
      await db.collection('sessions').doc(token).set(sessionData);
    } catch (e: any) {
      console.warn('Firestore saveSession failed:', e.message || e);
    }
  }
}

export async function deleteSession(token: string): Promise<void> {
  const local = loadLocalDB();
  if (local.sessions && local.sessions[token]) {
    delete local.sessions[token];
    saveLocalDB(local);
  }

  if (useFirestore && db) {
    try {
      await db.collection('sessions').doc(token).delete();
    } catch (e: any) {
      console.warn('Firestore deleteSession failed:', e.message || e);
    }
  }
}

export async function saveFullContent(content: any): Promise<void> {
  const local = loadLocalDB();
  local.content = content;
  saveLocalDB(local);

  if (useFirestore && db) {
    try {
      for (const [subjectId, subjectData] of Object.entries(content)) {
        await db.collection('content').doc(subjectId).set(subjectData as any);
      }
    } catch (e: any) {
      console.warn('Firestore saveFullContent failed:', e.message || e);
    }
  }
}

export async function saveContentSubject(subjectId: string, subjectData: any): Promise<void> {
  const local = loadLocalDB();
  if (!local.content) local.content = {};
  local.content[subjectId] = subjectData;
  saveLocalDB(local);

  if (useFirestore && db) {
    try {
      await db.collection('content').doc(subjectId).set(subjectData);
    } catch (e: any) {
      console.warn('Firestore saveContentSubject failed:', e.message || e);
    }
  }
}

export async function deleteContentSubject(subjectId: string): Promise<void> {
  const local = loadLocalDB();
  if (local.content && local.content[subjectId]) {
    delete local.content[subjectId];
    saveLocalDB(local);
  }

  if (useFirestore && db) {
    try {
      await db.collection('content').doc(subjectId).delete();
    } catch (e: any) {
      console.warn('Firestore deleteContentSubject failed:', e.message || e);
    }
  }
}
