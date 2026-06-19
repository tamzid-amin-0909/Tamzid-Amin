import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import {
  getSettings, getNotices, getUsers, getSessions, getContent,
  saveSettings, saveNotices, saveUser, deleteUser, saveSession, deleteSession,
  saveFullContent, saveContentSubject, deleteContentSubject, seedFirestoreIfNeeded
} from './db-manager';

const app = express();
const PORT = 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Crypto Helpers for PHP AES-256-CBC Encrypted API payload replication
function getEncKey(token: string | null): Buffer | null {
  if (!token) return null;
  return crypto.createHash('sha256').update(token + '-enc-v1').digest();
}

function encryptJSON(data: any, token: string | null): any {
  const jsonStr = JSON.stringify(data);
  const encKey = getEncKey(token);
  if (encKey && token) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encKey, iv);
    let encrypted = cipher.update(jsonStr, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return {
      e: encrypted,
      i: iv.toString('base64')
    };
  }
  return data;
}

function sendResponse(res: any, data: any, httpCode = 200, req: any) {
  if (httpCode !== 200) {
    res.status(httpCode);
  }
  const token = getToken(req);
  if (token) {
    const encrypted = encryptJSON(data, token);
    res.json(encrypted);
  } else {
    res.json(data);
  }
}

function getToken(req: any): string {
  if (req.query.token) return (req.query.token as string).trim();
  const auth = req.headers['authorization'];
  if (auth && typeof auth === 'string') {
    return auth.replace(/^Bearer\s+/i, '').trim();
  }
  return '';
}

// Telegram SHA256 Hash matches PHP's hash_hmac raw binary key logic
function verifyTelegramHash(tgData: any, botToken: string): boolean {
  const checkHash = tgData.hash;
  if (!checkHash) return false;
  
  const dataArr: string[] = [];
  for (const [k, v] of Object.entries(tgData)) {
    if (k !== 'hash') {
      dataArr.push(`${k}=${v}`);
    }
  }
  dataArr.sort();
  const dataCheckStr = dataArr.join('\n');
  
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckStr).digest('hex');
  return computed === checkHash;
}

// Session Validation
async function validateSession(req: any): Promise<string | null> {
  const token = getToken(req);
  if (!token) return null;
  const sessions = await getSessions();
  const s = sessions[token];
  if (!s) return null;
  const now = Math.floor(Date.now() / 1000);
  if (now - s.lastActive > 86400) {
    await deleteSession(token);
    return null;
  }
  if (now - s.lastActive > 60) {
    s.lastActive = now;
    await saveSession(token, s);
  }
  return s.userId;
}

async function createSession(userId: string): Promise<string> {
  const sessions = await getSessions();
  const now = Math.floor(Date.now() / 1000);
  // Vacuum expired sessions
  for (const [tok, s] of Object.entries(sessions)) {
    if (now - (s as any).lastActive > 86400) {
      await deleteSession(tok);
    }
  }
  const token = crypto.randomBytes(32).toString('hex');
  await saveSession(token, {
    userId,
    createdAt: now,
    lastActive: now
  });
  return token;
}

// Permission Guards
async function reqAdmin(req: any, res: any): Promise<any | null> {
  const uid = await validateSession(req);
  if (!uid) {
    sendResponse(res, { error: 'Authentication required' }, 401, req);
    return null;
  }
  const users = await getUsers();
  const role = users[uid]?.role || '';
  if (role !== 'admin') {
    sendResponse(res, { error: 'Admin required' }, 403, req);
    return null;
  }
  return uid;
}

async function reqAdminOrSubAdmin(req: any, res: any): Promise<any | null> {
  const uid = await validateSession(req);
  if (!uid) {
    sendResponse(res, { error: 'Authentication required' }, 401, req);
    return null;
  }
  const users = await getUsers();
  const user = users[uid];
  if (!user) {
    sendResponse(res, { error: 'User not found' }, 401, req);
    return null;
  }
  const role = user.role || '';
  if (role !== 'admin' && role !== 'subadmin') {
    sendResponse(res, { error: 'Access denied' }, 403, req);
    return null;
  }
  return { uid, role, user };
}

// Category / Nested list content tree navigation helper
function getNode(content: any, pathStr: string): any {
  const parts = pathStr.split('/').filter(p => p.trim() !== '');
  let cur = content;
  for (let i = 0; i < parts.length; i++) {
    const k = parts[i];
    if (!cur || !cur[k]) return null;
    cur = cur[k];
    if (i < parts.length - 1) {
      if (!cur.children) return null;
      cur = cur.children;
    }
  }
  return cur;
}

function parentRef(content: any, pathStr: string): any {
  const parts = pathStr.split('/').filter(p => p.trim() !== '');
  let cur = content;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (!cur || !cur[k]) return null;
    cur = cur[k];
    if (!cur.children) cur.children = {};
    cur = cur.children;
  }
  return cur;
}

function noChildren(item: any): any {
  if (!item || typeof item !== 'object') return item;
  const copy = { ...item };
  delete copy.children;
  return copy;
}

function graftChildren(inc: any, stored: any) {
  for (const [slug, s] of Object.entries(stored)) {
    if (!inc[slug]) continue;
    if ((s as any).children && Object.keys((s as any).children).length > 0) {
      if (!inc[slug].children) inc[slug].children = (s as any).children;
      else graftChildren(inc[slug].children, (s as any).children);
    }
  }
}

function preserveChildren(stored: any, slug: string, node: any) {
  const currentObject = stored[slug];
  const currentChildren = currentObject?.children;
  if (currentChildren && Object.keys(currentChildren).length > 0) {
    node.children = currentChildren;
  } else if (!node.children) {
    node.children = {};
  }
}

function userResponse(uid: string, user: any) {
  return {
    id: uid,
    role: user.role,
    access: user.access || [],
    subAdminPerms: user.subAdminPerms || null,
    isTelegramUser: user.isTelegramUser || false,
    telegramName: user.telegramName || null,
    trialEnd: user.trialEnd || null,
  };
}

// Telegram Channel Membership Checker
async function checkTgChannels(req: any, res: any) {
  const settings = await getSettings();
  const channels = settings.requiredTgChannels || [];
  const botToken = settings.tgBotToken || settings.telegramBotToken || '';

  if (!channels.length || !botToken) {
    return sendResponse(res, { notJoined: [] }, 200, req);
  }

  const token = getToken(req);
  if (!token) return sendResponse(res, { notJoined: [] }, 200, req);
  const sessions = await getSessions();
  const sess = sessions[token];
  if (!sess) return sendResponse(res, { notJoined: [] }, 200, req);
  const uid = sess.userId;
  const users = await getUsers();
  const user = users[uid];
  if (!user || !user.telegramId) {
    return sendResponse(res, { notJoined: [] }, 200, req);
  }

  const tgUserId = user.telegramId;
  const notJoined: any[] = [];

  for (const ch of channels) {
    let chatId = ch.username;
    if (chatId.includes('t.me/')) {
      chatId = '@' + chatId.replace(/.*t\.me\//, '');
    }
    if (!chatId.startsWith('@') && isNaN(Number(chatId))) {
      chatId = '@' + chatId;
    }
    
    const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(chatId)}&user_id=${encodeURIComponent(tgUserId)}`;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data: any = await response.json();
      const status = data?.result?.status || 'left';
      if (!['member', 'administrator', 'creator'].includes(status)) {
        notJoined.push(ch);
      }
    } catch (e) {
      // skip on network errors
    }
  }

  return sendResponse(res, { notJoined }, 200, req);
}

// ── REDWAN'S METHOD SCRAPING AND TRANSFORM UTILITIES ───────────────────────
const RM_AUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg4YzMxYmY2NmZlZTk5YWRhYjJiZjkiLCJlbWFpbCI6InllYW1pbmFsdGF3c2lmQGdtYWlsLmNvbSIsIm5hbWUiOiJIQUNLRVIgMDA3Iiwicm9sZSI6InVzZXIiLCJkZXZpY2VJZCI6IjcyMzY2YTU1IiwiaWF0IjoxNzc3NzQzNDMwfQ.VGfdj5nbgn9bhghmjPVHzlfU7IP-CFK9l3PSSLyyZ2o';
const BASE_API = 'https://api.redwansmethod.com';

async function rmGet(endpoint: string): Promise<any> {
  const url = BASE_API + endpoint;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json, text/plain, */*',
      'authorization': RM_AUTH,
      'origin': 'https://redwansmethod.com',
      'referer': 'https://redwansmethod.com/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`RM API returned HTTP ${response.status} for ${endpoint}`);
  }

  return await response.json();
}

async function getFullCourseStructure(courseId: string): Promise<any[]> {
  const subjectRes = await rmGet(`/subjects/fetchAllSubjects/${courseId}`);
  const subjects = subjectRes?.subjects || [];
  const structure: any[] = [];

  for (const sub of subjects) {
    if (!sub || !sub._id) continue;
    try {
      const chapterRes = await rmGet(`/chapters/fetchAllChapters/${sub._id}`);
      const chapters = chapterRes?.chapters || [];
      const subObj = { subject: sub.subjectName, subjectThumbnail: sub.subjectThumbnail || '', chapters: [] as any[] };

      for (const chap of chapters) {
        if (!chap || !chap._id) continue;
        try {
          const videoRes = await rmGet(`/videos/fetchAllVideos/${chap._id}`);
          subObj.chapters.push({
            chapterName: chap.chapterName,
            chapterThumbnail: chap.chapterThumbnail || '',
            lectures: videoRes?.videos || []
          });
        } catch (err: any) {
          console.error(`Error fetching lectures for chapter ${chap.chapterName}:`, err.message || err);
        }
      }
      structure.push(subObj);
    } catch (err: any) {
      console.error(`Error fetching chapters for subject ${sub.subjectName}:`, err.message || err);
    }
  }

  return structure;
}

function formatRMData(data: any[]): any {
  const root: any = {};

  for (const item of data) {
    if (!item || !item.subject) continue;
    const subKey = item.subject.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');

    root[subKey] = {
      title: item.subject,
      thumbnail: item.subjectThumbnail || item.thumbnail || '',
      type: 'category',
      description: item.subject,
      children: {} as any
    };

    if (item.chapters && Array.isArray(item.chapters)) {
      item.chapters.forEach((chap: any, cIdx: number) => {
        const chapKey = 'id_' + (cIdx + 1);
        root[subKey].children[chapKey] = {
          title: chap.chapterName || '',
          thumbnail: chap.chapterThumbnail || chap.thumbnail || '',
          type: 'category',
          children: {} as any
        };

        if (chap.lectures && Array.isArray(chap.lectures)) {
          chap.lectures.forEach((lec: any) => {
            const lecNum = lec.videoNumber || '0';
            const lecKey = 'lec_' + lecNum;

            const descArr: string[] = [];
            if (lec.videoLectureSheetURL) {
              descArr.push('Lecture Sheet--> ' + lec.videoLectureSheetURL.trim());
            }
            if (lec.videoLectureNoteURL || lec.videoNoteURL) {
              descArr.push('Note--> ' + (lec.videoLectureNoteURL || lec.videoNoteURL).trim());
            }
            if (lec.videoPracticeSheetURL) {
              descArr.push('Practice Sheet--> ' + lec.videoPracticeSheetURL.trim());
            }
            if (lec.videoSolveSheetURL) {
              descArr.push('Solve Sheet--> ' + lec.videoSolveSheetURL.trim());
            }

            root[subKey].children[chapKey].children[lecKey] = {
              title: lec.videoTitle || '',
              type: 'video',
              description: descArr.join('\n'),
              url: lec.videoURL || lec.videoYoutubeURL || ''
            };
          });
        }
      });
    }
  }

  return root;
}

// ── EXPOSED API ROUTE MAP ───────────────────────────────────────────────────
app.all(['/api.php', '/databaseuploader.php', '/app/databaseuploader.php'], async (req, res) => {
  const ua = req.headers['user-agent'] || '';
  if (ua.indexOf('EduZod/1.0') === -1) {
    res.end();
    return;
  }
  
  const action = req.query.action as string || '';
  const type = req.query.type as string || '';
  const token = getToken(req);

  try {
    // ── ACTION: GET DB
    if (action === 'get_db') {
      const auth = await reqAdminOrSubAdmin(req, res);
      if (!auth) return;

      const settings = await getSettings();
      const notices = await getNotices();
      const content = await getContent();
      const users = await getUsers();
      const sessions = await getSessions();

      const mainDatabase = { settings, notices, content, users, sessions };
      return res.json(mainDatabase);
    }

    // ── ACTION: UPDATE RM
    if (action === 'update_rm') {
      const auth = await reqAdminOrSubAdmin(req, res);
      if (!auth) return;

      const settings = await getSettings();
      const notices = await getNotices();
      const content = await getContent();
      const users = await getUsers();
      const sessions = await getSessions();

      const mainDatabase = { settings, notices, content, users, sessions };
      const oldDbRaw = JSON.stringify(mainDatabase, null, 2);

      const log: any[] = [];
      log.push({ status: 'ok', msg: 'Loaded live Cloud Database state' });

      // Fetch each course
      const COURSES = [
        { id: '694ea8c903a0f734e8b68247', subject: 'english' },
        { id: '694ea94dde6c9d2b770cecfa', subject: 'ict' },
        { id: '6931e5ae10efdc5c7232a04f', subject: 'physics' },
        { id: '694ea7e920e2df4356c9ff1e', subject: 'bangla' },
        { id: '6931e4f59dd4de5bdb2d0f57', subject: 'general_math' },
        { id: '6931e47941505d8b6ae2c8c1', subject: 'higher_math' },
        { id: '6931e3e541505d8b6ae2c7f6', subject: 'biology' },
        { id: '6931f9f641505d8b6ae2e2b4', subject: 'bgs' },
        { id: '6931e56a41505d8b6ae2cbd0', subject: 'chemistry' },
      ];

      for (const course of COURSES) {
        const courseId = course.id;
        const subjectKey = course.subject;

        log.push({ status: 'info', msg: `Fetching course: ${subjectKey} (${courseId})` });

        try {
          const courseData = await getFullCourseStructure(courseId);
          const formatted = formatRMData(courseData);

          if (!mainDatabase.content) {
            mainDatabase.content = {};
          }

          if (!mainDatabase.content[subjectKey]) {
            log.push({ status: 'warn', msg: `Subject key '${subjectKey}' not in content — creating it` });
            mainDatabase.content[subjectKey] = {
              title: subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1),
              type: 'category',
              children: {}
            };
          }

          if (!mainDatabase.content[subjectKey].children) {
            mainDatabase.content[subjectKey].children = {};
          }

          // Merge each subcategory
          for (const [k, v] of Object.entries(formatted)) {
            mainDatabase.content[subjectKey].children[k] = v;
          }

          log.push({ status: 'ok', msg: `Merged course '${subjectKey}' successfully` });
        } catch (err: any) {
          log.push({ status: 'error', msg: `Failed to fetch '${subjectKey}': ${err.message || err}` });
        }
      }

      // Save updated database back to live Firestore DB
      try {
        await saveFullContent(mainDatabase.content);
        log.push({ status: 'ok', msg: 'Saved updated Content catalog directly to Live Firebase Firestore!' });
      } catch (err: any) {
        log.push({ status: 'error', msg: `Failed to save live content to Firebase: ${err.message}` });
      }

      // Save database.json locally
      const newDbRaw = JSON.stringify(mainDatabase, null, 2);
      try {
        fs.writeFileSync('database.json', newDbRaw, 'utf-8');
        log.push({ status: 'ok', msg: 'Successfully updated local database.json' });
      } catch (err: any) {
        log.push({ status: 'error', msg: `Failed to save database.json locally: ${err.message}` });
      }

      // Build zip file using adm-zip
      const zip = new AdmZip();
      zip.addFile('database_OLD.json', Buffer.from(oldDbRaw, 'utf-8'));
      zip.addFile('database_NEW.json', Buffer.from(newDbRaw, 'utf-8'));
      zip.addFile('update_log.json', Buffer.from(JSON.stringify(log, null, 2), 'utf-8'));

      const zipBuffer = zip.toBuffer();
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="rm_database_update.zip"');
      res.setHeader('Content-Length', zipBuffer.length.toString());
      return res.send(zipBuffer);
    }

    // ── TELEGRAM LOGIN
    if (action === 'auth' && type === 'telegram') {
      const body = req.body || {};
      const tgData = body.tgData;
      const deviceId = (body.deviceId || '').trim();

      if (!tgData) return sendResponse(res, { error: 'Missing Telegram data' }, 400, req);

      const settings = await getSettings();
      const botToken = (settings.telegramBotToken || '8714027089:AAHDntPcUe_qwDmhnJCTrm9FDuQqoX_8X_U').trim();
      
      const checkHash = tgData.hash || '';
      if (!checkHash) return sendResponse(res, { error: 'Missing hash from Telegram data' }, 400, req);

      const isValid = verifyTelegramHash(tgData, botToken);
      if (!isValid) {
        return sendResponse(res, { error: 'Telegram auth verification failed. Check bot token in Settings.' }, 401, req);
      }

      if (Math.floor(Date.now() / 1000) - parseInt(tgData.auth_date || '0') > 86400) {
        return sendResponse(res, { error: 'Telegram auth data expired. Please try again.' }, 401, req);
      }

      const tgId = String(tgData.id || '');
      const tgName = (`${tgData.first_name || ''} ${tgData.last_name || ''}`).trim();
      const tgUser = tgData.username || tgId;

      const users = await getUsers();
      let existingUid: string | null = null;
      for (const [uid, u] of Object.entries(users)) {
        if ((u as any).telegramId === tgId) {
          existingUid = uid;
          break;
        }
      }

      const trialMinutes = parseInt(settings.trialMinutes || '8', 10);
      const trialMs = trialMinutes * 60 * 1000;
      const trialAccess = settings.trialAccess || ['none'];

      let user: any;
      if (!existingUid) {
        let newUid = 'tg_' + tgId;
        if (users[newUid]) {
          newUid = 'tg_' + tgId + '_' + crypto.randomBytes(3).toString('hex').slice(0, 4);
        }
        const nowMs = Date.now();
        user = {
          password: '',
          role: 'student',
          access: trialAccess,
          telegramId: tgId,
          telegramName: tgName,
          telegramUser: tgUser,
          isTelegramUser: true,
          trialStart: nowMs,
          trialEnd: nowMs + trialMs,
        };
        existingUid = newUid;
        await saveUser(newUid, user);
      } else {
        user = users[existingUid];
        user.telegramName = tgName;
        user.telegramUser = tgUser;
        const nowMs = Date.now();
        if (user.trialEnd && user.trialEnd > nowMs) {
          user.access = trialAccess;
        }
        await saveUser(existingUid, user);
      }

      // Block login if trial expired
      const nowMsCheck = Date.now();
      const hasRealAccess = user.access && user.access.length && !user.access.includes('none');
      if (user.trialEnd && user.trialEnd < nowMsCheck && !hasRealAccess) {
        return sendResponse(res, {
          error: 'trial_expired',
          message: 'Your free trial has expired. Please contact the admin to purchase access.'
        }, 403, req);
      }

      // Device lock check
      if (user.role !== 'admin' && deviceId) {
        const locked = user.lockedDevice || null;
        const lockTime = user.deviceLockTime || 0;
        const expired = (nowMsCheck - lockTime) >= 3 * 24 * 60 * 60 * 1000;
        if (locked && locked !== deviceId && !expired) {
          const daysLeft = Math.ceil((3 * 24 * 60 * 60 * 1000 - (nowMsCheck - lockTime)) / 86400000);
          return sendResponse(res, { error: 'Device locked', daysLeft }, 403, req);
        }
      }

      const newToken = await createSession(existingUid);
      user.currentSession = newToken;
      if (user.role !== 'admin' && deviceId) {
        user.lockedDevice = deviceId;
        user.deviceLockTime = Date.now();
      }
      await saveUser(existingUid, user);

      return sendResponse(res, {
        token: newToken,
        user: userResponse(existingUid, user)
      }, 200, req);
    }

    // ── STANDARD LOGIN
    if (action === 'auth' && type === 'login') {
      const body = req.body || {};
      const username = (body.username || '').trim();
      const password = body.password || '';
      const deviceId = (body.deviceId || '').trim();

      if (!username || !password) {
        return sendResponse(res, { error: 'Fields required' }, 400, req);
      }

      const users = await getUsers();
      const user = users[username];
      if (!user || user.password !== password) {
        return sendResponse(res, { error: 'Invalid credentials' }, 401, req);
      }

      if (user.role !== 'admin' && deviceId) {
        const locked = user.lockedDevice || null;
        const lockTime = user.deviceLockTime || 0;
        const nowMs = Date.now();
        const expired = (nowMs - lockTime) >= 3 * 24 * 60 * 60 * 1000;
        if (locked && locked !== deviceId && !expired) {
          const daysLeft = Math.ceil((3 * 24 * 60 * 60 * 1000 - (nowMs - lockTime)) / 86400000);
          return sendResponse(res, { error: 'Device locked', daysLeft }, 403, req);
        }
      }

      const newToken = await createSession(username);
      const rmToken = crypto.randomBytes(24).toString('hex');
      
      user.rememberToken = rmToken;
      user.currentSession = newToken;
      if (user.role !== 'admin' && deviceId) {
        user.lockedDevice = deviceId;
        user.deviceLockTime = Date.now();
      }
      await saveUser(username, user);

      return sendResponse(res, {
        token: newToken,
        rememberToken: rmToken,
        user: userResponse(username, user)
      }, 200, req);
    }

    // ── LOGOUT
    if (action === 'auth' && type === 'logout') {
      if (token) {
        await deleteSession(token);
      }
      return sendResponse(res, { status: 'success' }, 200, req);
    }

    // ── VALIDATE
    if (action === 'auth' && type === 'validate') {
      const uid = await validateSession(req);
      if (!uid) return sendResponse(res, { error: 'Session expired' }, 401, req);

      const users = await getUsers();
      const user = users[uid];
      if (!user) return sendResponse(res, { error: 'User gone' }, 401, req);

      if ((user.currentSession || '').startsWith('INVALIDATED-')) {
        await deleteSession(token);
        return sendResponse(res, {
          error: 'session_invalidated',
          message: 'Session ended by administrator.'
        }, 401, req);
      }

      return sendResponse(res, {
        user: {
          ...userResponse(uid, user),
          lockedDevice: user.lockedDevice || null
        }
      }, 200, req);
    }

    // ── COOKIE LOGIN
    if (action === 'auth' && type === 'cookie') {
      const body = req.body || {};
      const uid = body.userId || '';
      const ctok = body.rememberToken || '';
      const devId = (body.deviceId || '').trim();

      if (!uid || !ctok) return sendResponse(res, { error: 'Missing fields' }, 400, req);

      const users = await getUsers();
      const user = users[uid];
      if (!user || user.rememberToken !== ctok) {
        return sendResponse(res, { error: 'Invalid cookie' }, 401, req);
      }

      if (user.role !== 'admin' && devId) {
        const locked = user.lockedDevice || null;
        const nowMs = Date.now();
        const expired = (nowMs - (user.deviceLockTime || 0)) >= 3 * 24 * 60 * 60 * 1000;
        if (locked && locked !== devId && !expired) {
          return sendResponse(res, { error: 'device_locked' }, 403, req);
        }
        user.lockedDevice = devId;
        user.deviceLockTime = nowMs;
        await saveUser(uid, user);
      }

      const newToken = await createSession(uid);
      return sendResponse(res, {
        token: newToken,
        user: userResponse(uid, user)
      }, 200, req);
    }

    // ── HOME DATA
    if (action === 'data' && type === 'home') {
      const settings = await getSettings();
      const notices = await getNotices();
      const content = await getContent();

      const slimContent: any = {};
      for (const [slug, item] of Object.entries(content)) {
        slimContent[slug] = noChildren(item);
      }

      const out: any = { settings, notices, content: slimContent };
      
      const uid = await validateSession(req);
      if (uid) {
        const users = await getUsers();
        if (users[uid]) {
          out.currentUser = userResponse(uid, users[uid]);
        }
      }
      return sendResponse(res, out, 200, req);
    }

    // ── CHILDREN
    if (action === 'data' && type === 'children') {
      const pathParam = req.query.path as string || '';
      if (!pathParam) return sendResponse(res, { error: 'path required' }, 400, req);

      const content = await getContent();
      const node = getNode(content, pathParam);
      if (!node) return sendResponse(res, { error: `Not found: ${pathParam}` }, 404, req);

      const kids: any = {};
      if (node.children) {
        for (const [slug, child] of Object.entries(node.children)) {
          kids[slug] = noChildren(child);
        }
      }
      return sendResponse(res, { children: kids }, 200, req);
    }

    // ── FULL READ (admin + subadmin)
    if (action === 'read') {
      const auth = await reqAdminOrSubAdmin(req, res);
      if (!auth) return;

      const settings = await getSettings();
      const notices = await getNotices();
      const users = await getUsers();
      const content = await getContent();
      
      const slim = req.query.slim === '1';

      if (auth.role === 'subadmin') {
        const perms = auth.user.subAdminPerms || [];
        const hasUserPerm = perms.includes('users') || perms.includes('all');
        const hasContentPerm = perms.some((p: string) => p.startsWith('content:')) || perms.includes('all');
        
        const out: any = { settings, notices };
        if (hasUserPerm) {
          const filteredUsers: any = {};
          for (const [uid, u] of Object.entries(users)) {
            if ((u as any).createdBy === auth.uid) {
              filteredUsers[uid] = u;
            }
          }
          out.users = filteredUsers;
        }
        if (hasContentPerm && !slim) {
          out.content = content;
        }
        return sendResponse(res, out, 200, req);
      }

      if (slim) {
        return sendResponse(res, { users, settings, notices }, 200, req);
      }
      return sendResponse(res, { users, settings, notices, content }, 200, req);
    }

    // ── PATCH CONTENT
    if (action === 'patch' && type === 'content') {
      const body = req.body || {};
      const op = body.op || '';
      const pathParam = (body.path || body.from || '').replace(/^\/|\/$/g, '');

      const auth = await reqAdminOrSubAdmin(req, res);
      if (!auth) return;

      if (auth.role === 'subadmin') {
        const perms = auth.user.subAdminPerms || [];
        const hasAll = perms.includes('content:all') || perms.includes('all');
        if (!hasAll) {
          const rootSlug = pathParam.split('/')[0];
          const hasPerm = perms.some((p: string) => p === `content:${rootSlug}` || p.startsWith(`content:${rootSlug}`));
          if (!hasPerm) {
            return sendResponse(res, { error: 'No permission to edit this content section' }, 403, req);
          }
        }
      }

      const content = await getContent();

      if (op === 'set') {
        const node = body.data;
        if (!pathParam || node === undefined) {
          return sendResponse(res, { error: 'path+data required' }, 400, req);
        }

        const parts = pathParam.split('/');
        const slug = parts.pop()!;
        const pp = parts.join('/');

        if (pp === '') {
          preserveChildren(content, slug, node);
          content[slug] = node;
          await saveContentSubject(slug, node);
        } else {
          const par = parentRef(content, pathParam);
          if (!par) return sendResponse(res, { error: 'Parent not found' }, 404, req);
          preserveChildren(par, slug, node);
          par[slug] = node;
          
          const rootSlug = parts[0];
          await saveContentSubject(rootSlug, content[rootSlug]);
        }

        return sendResponse(res, { status: 'success' }, 200, req);
      }

      if (op === 'delete') {
        const parts = pathParam.split('/');
        const slug = parts.pop()!;
        const pp = parts.join('/');

        if (pp === '') {
          delete content[slug];
          await deleteContentSubject(slug);
        } else {
          const par = parentRef(content, pathParam);
          if (par) delete par[slug];
          const rootSlug = parts[0];
          await saveContentSubject(rootSlug, content[rootSlug]);
        }
        return sendResponse(res, { status: 'success' }, 200, req);
      }

      if (op === 'move' || op === 'copy') {
        const from = (body.from || '').replace(/^\/|\/$/g, '');
        const to = (body.to || '').replace(/^\/|\/$/g, '');
        if (!from || !to) return sendResponse(res, { error: 'from+to required' }, 400, req);

        const fparts = from.split('/'); const fslug = fparts.pop()!; const fpp = fparts.join('/');
        const tparts = to.split('/');   const tslug = tparts.pop()!;   const tpp = tparts.join('/');

        const fpar = (fpp === '') ? content : parentRef(content, from);
        if (!fpar || !fpar[fslug]) return sendResponse(res, { error: 'Source not found' }, 404, req);

        const nodeCopy = JSON.parse(JSON.stringify(fpar[fslug]));

        if (tpp === '') {
          content[tslug] = nodeCopy;
          await saveContentSubject(tslug, nodeCopy);
        } else {
          const tpar = parentRef(content, to);
          if (!tpar) return sendResponse(res, { error: 'Dest not found' }, 404, req);
          tpar[tslug] = nodeCopy;
          await saveContentSubject(tparts[0], content[tparts[0]]);
        }

        if (op === 'move') {
          if (fpp === '') {
            delete content[fslug];
            await deleteContentSubject(fslug);
          } else {
            const fp = parentRef(content, from);
            if (fp) delete fp[fslug];
            await saveContentSubject(fparts[0], content[fparts[0]]);
          }
        }
        return sendResponse(res, { status: 'success' }, 200, req);
      }

      return sendResponse(res, { error: `Unknown op: ${op}` }, 400, req);
    }

    // ── PATCH SETTINGS
    if (action === 'patch' && type === 'settings') {
      const auth = await reqAdmin(req, res);
      if (!auth) return;

      const body = req.body;
      if (!body) return sendResponse(res, { error: 'Bad JSON' }, 400, req);
      await saveSettings(body);
      return sendResponse(res, { status: 'success' }, 200, req);
    }

    // ── PATCH NOTICES
    if (action === 'patch' && type === 'notices') {
      const auth = await reqAdminOrSubAdmin(req, res);
      if (!auth) return;

      const perms = auth.user.subAdminPerms || [];
      if (auth.role === 'subadmin' && !perms.includes('notices') && !perms.includes('all')) {
        return sendResponse(res, { error: 'No permission: notices' }, 403, req);
      }

      const body = req.body;
      if (!body || !Array.isArray(body)) return sendResponse(res, { error: 'Bad JSON' }, 400, req);
      await saveNotices(body);
      return sendResponse(res, { status: 'success' }, 200, req);
    }

    // ── PATCH USER
    if (action === 'patch' && type === 'user') {
      const auth = await reqAdminOrSubAdmin(req, res);
      if (!auth) return;

      const perms = auth.user.subAdminPerms || [];
      if (auth.role === 'subadmin' && !perms.includes('users') && !perms.includes('all')) {
        return sendResponse(res, { error: 'No permission: users' }, 403, req);
      }

      const body = req.body || {};
      const uid = body.userId || '';
      const d = body.data;
      if (!uid || !d) return sendResponse(res, { error: 'userId+data required' }, 400, req);

      const users = await getUsers();
      const ex = users[uid];

      if (auth.role === 'subadmin') {
        if (ex && ex.createdBy !== auth.uid) {
          return sendResponse(res, { error: 'Cannot edit this user' }, 403, req);
        }
        if (['admin', 'subadmin'].includes(d.role || '')) {
          return sendResponse(res, { error: 'Cannot assign elevated role' }, 403, req);
        }
        if (ex && ['admin', 'subadmin'].includes(ex.role || '')) {
          return sendResponse(res, { error: 'Cannot edit admin/subadmin' }, 403, req);
        }
        if (!ex && !d.createdBy) {
          d.createdBy = auth.uid;
        }
        d.lastEditedBy = auth.uid;
      }

      const fields = ['currentSession', 'rememberToken', 'lockedDevice', 'deviceLockTime', 'telegramId', 'telegramName', 'isTelegramUser', 'trialStart', 'trialEnd', 'createdBy'];
      for (const f of fields) {
        if (d[f] === undefined && ex && ex[f] !== undefined) {
          d[f] = ex[f];
        }
      }

      await saveUser(uid, d);
      return sendResponse(res, { status: 'success' }, 200, req);
    }

    // ── DELETE USER
    if (action === 'patch' && type === 'deleteuser') {
      const auth = await reqAdminOrSubAdmin(req, res);
      if (!auth) return;

      const perms = auth.user.subAdminPerms || [];
      if (auth.role === 'subadmin' && !perms.includes('users') && !perms.includes('all')) {
        return sendResponse(res, { error: 'No permission: users' }, 403, req);
      }

      const body = req.body || {};
      const uid = body.userId || '';
      if (!uid) return sendResponse(res, { error: 'userId required' }, 400, req);

      const users = await getUsers();
      const target = users[uid];
      if (!target) return sendResponse(res, { error: 'User not found' }, 404, req);

      if (auth.role === 'subadmin') {
        if (target.createdBy !== auth.uid) {
          return sendResponse(res, { error: 'Cannot delete this user' }, 403, req);
        }
        if (['admin', 'subadmin'].includes(target.role || '')) {
          return sendResponse(res, { error: 'Cannot delete admin/subadmin' }, 403, req);
        }
      }

      await deleteUser(uid);
      return sendResponse(res, { status: 'success' }, 200, req);
    }

    // ── PROMOTE/UPDATE SUBADMIN
    if (action === 'patch' && type === 'subadmin') {
      const auth = await reqAdmin(req, res);
      if (!auth) return;

      const body = req.body || {};
      const uid = body.userId || '';
      const perms = body.permissions || [];
      if (!uid) return sendResponse(res, { error: 'userId required' }, 400, req);

      const users = await getUsers();
      const u = users[uid];
      if (!u) return sendResponse(res, { error: 'User not found' }, 404, req);

      u.role = 'subadmin';
      u.subAdminPerms = perms;
      u.currentSession = 'INVALIDATED-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
      await saveUser(uid, u);
      return sendResponse(res, { status: 'success' }, 200, req);
    }

    // ── REVOKE SUBADMIN
    if (action === 'patch' && type === 'revoke-subadmin') {
      const auth = await reqAdmin(req, res);
      if (!auth) return;

      const body = req.body || {};
      const uid = body.userId || '';
      if (!uid) return sendResponse(res, { error: 'userId required' }, 400, req);

      const users = await getUsers();
      const u = users[uid];
      if (!u) return sendResponse(res, { error: 'User not found' }, 404, req);

      u.role = 'student';
      delete u.subAdminPerms;
      u.currentSession = 'INVALIDATED-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex');
      await saveUser(uid, u);
      return sendResponse(res, { status: 'success' }, 200, req);
    }

    // ── RESET TRIAL
    if (action === 'patch' && type === 'reset-trial') {
      const auth = await reqAdmin(req, res);
      if (!auth) return;

      const body = req.body || {};
      const uid = body.userId || '';
      if (!uid) return sendResponse(res, { error: 'userId required' }, 400, req);

      const users = await getUsers();
      const u = users[uid];
      if (!u) return sendResponse(res, { error: 'User not found' }, 404, req);
      if (!u.isTelegramUser) return sendResponse(res, { error: 'Not a Telegram user' }, 400, req);

      const settings = await getSettings();
      const trialMinutes = parseInt(settings.trialMinutes || '8', 10);
      const trialMs = trialMinutes * 60 * 1000;
      const trialAccess = settings.trialAccess || ['none'];
      const nowMs = Date.now();

      u.trialStart = nowMs;
      u.trialEnd = nowMs + trialMs;
      u.trialResetBy = 'admin';
      u.access = trialAccess;
      await saveUser(uid, u);
      
      return sendResponse(res, { status: 'success', trialEnd: nowMs + trialMs }, 200, req);
    }

    // ── RESET ALL DEVICES
    if (action === 'patch' && type === 'reset-all-devices') {
      const auth = await reqAdmin(req, res);
      if (!auth) return;

      const users = await getUsers();
      let count = 0;
      for (const [uid, u] of Object.entries(users)) {
        const userObj = u as any;
        if (userObj.lockedDevice || userObj.deviceLockTime) {
          userObj.lockedDevice = null;
          userObj.deviceLockTime = null;
          await saveUser(uid, userObj);
          count++;
        }
      }

      return sendResponse(res, { status: 'success', reset: count }, 200, req);
    }

    // ── RESET ALL TG TRIALS
    if (action === 'patch' && type === 'reset-all-trials') {
      const auth = await reqAdmin(req, res);
      if (!auth) return;

      const settings = await getSettings();
      const trialMinutes = parseInt(settings.trialMinutes || '8', 10);
      const trialMs = trialMinutes * 60 * 1000;
      const trialAccess = settings.trialAccess || ['none'];
      const nowMs = Date.now();

      const users = await getUsers();
      let count = 0;
      for (const [uid, u] of Object.entries(users)) {
        const userObj = u as any;
        if (userObj.isTelegramUser) {
          userObj.trialStart = nowMs;
          userObj.trialEnd = nowMs + trialMs;
          userObj.trialResetBy = 'admin-bulk';
          userObj.access = trialAccess;
          await saveUser(uid, userObj);
          count++;
        }
      }

      return sendResponse(res, { status: 'success', reset: count }, 200, req);
    }

    // ── CHECK TG CHANNEL MEMBERSHIP
    if (action === 'check_tg_channels') {
      await checkTgChannels(req, res);
      return;
    }

    // ── FULL WRITE
    if (action === 'write') {
      const auth = await reqAdmin(req, res);
      if (!auth) return;

      const body = req.body;
      if (!body) return sendResponse(res, { error: 'Empty body' }, 400, req);

      const currentContent = await getContent();
      if (body.content) {
        graftChildren(body.content, currentContent);
        await saveFullContent(body.content);
      }

      if (body.settings) await saveSettings(body.settings);
      if (body.notices) await saveNotices(body.notices);
      
      if (body.users) {
        for (const [uid, uData] of Object.entries(body.users)) {
          await saveUser(uid, uData);
        }
      }

      return sendResponse(res, { status: 'success' }, 200, req);
    }

    return sendResponse(res, { error: `Bad request: action=${action} type=${type}` }, 400, req);

  } catch (error: any) {
    console.error('API Error:', error);
    return sendResponse(res, { error: 'Server exploded', details: error.message }, 500, req);
  }
});

// Serve direct client files
app.use(express.static(process.cwd()));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node Full-Stack Express Server active on http://0.0.0.0:${PORT}`);
});
