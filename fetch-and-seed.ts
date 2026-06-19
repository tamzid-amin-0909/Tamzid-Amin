import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('--- STARTING GITHUB DB FETCH AND FIREBASE SEED ---');
  const dbUrl = 'https://raw.githubusercontent.com/tamzid-amin-0909/GitWeb/main/database.json';
  
  try {
    console.log(`Fetching database.json from ${dbUrl}...`);
    const response = await fetch(dbUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch database.json: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Successfully fetched database.json from GitHub!');
    
    // Save to local database.json
    fs.writeFileSync('database.json', JSON.stringify(data, null, 2), 'utf-8');
    console.log('Saved data to local database.json file.');

    // Initialize Firebase
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('firebase-applet-config.json does not exist. Dynamic Firestore seeding skipped (Local mode active).');
      return;
    }

    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log(`Connected to Firestore! Project: ${firebaseConfig.projectId}, Database: ${firebaseConfig.firestoreDatabaseId}`);

    // Clean up or overwrite Firestore databases.
    // 1. Seed settings
    if (data.settings) {
      console.log('Writing settings config to Firestore...');
      await setDoc(doc(db, 'config', 'settings'), data.settings);
    }
    
    // 2. Seed notices
    if (data.notices) {
      console.log('Writing notices config to Firestore...');
      await setDoc(doc(db, 'config', 'notices'), { list: data.notices });
    }
    
    // 3. Seed users
    if (data.users) {
      console.log('Updating users in Firestore...');
      const batch = writeBatch(db);
      let count = 0;
      for (const [userId, userData] of Object.entries(data.users)) {
        const docRef = doc(db, 'users', userId);
        batch.set(docRef, userData as any);
        count++;
      }
      await batch.commit();
      console.log(`Wrote ${count} users successfully to Firestore.`);
    }
    
    // 4. Seed sessions
    if (data.sessions) {
      console.log('Uploading sessions in Firestore...');
      const batch = writeBatch(db);
      let scl = 0;
      for (const [tokenId, sessionData] of Object.entries(data.sessions)) {
        const docRef = doc(db, 'sessions', tokenId);
        batch.set(docRef, sessionData as any);
        scl++;
      }
      if (scl > 0) {
        await batch.commit();
      }
      console.log(`Wrote ${scl} sessions to Firestore.`);
    }

    // 5. Seed content subjects
    if (data.content) {
      console.log('Uploading content category trees to Firestore...');
      let subCount = 0;
      for (const [subjectId, subjectData] of Object.entries(data.content)) {
        await setDoc(doc(db, 'content', subjectId), subjectData as any);
        subCount++;
        console.log(`Uploaded subject content: ${subjectId}`);
      }
      console.log(`Wrote ${subCount} content records successfully to Firestore.`);
    }

    console.log('--- FIREBASE SEEDING COMPLETED SUCCESSFULLY ---');
  } catch (error: any) {
    console.error('CRITICAL ERROR during fetch and seed:', error.message || error);
    process.exit(1);
  }
}

main();
