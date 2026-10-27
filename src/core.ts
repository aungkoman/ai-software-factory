import Database from 'better-sqlite3';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const states = ['PENDING','READY','RUNNING','VERIFYING','WAITING_APPROVAL','COMPLETED','RETRY_PENDING','BLOCKED'] as const;
export type State = typeof states[number];
const transitions: Record<State, readonly State[]> = {
 PENDING:['READY','WAITING_APPROVAL','BLOCKED'], READY:['RUNNING','BLOCKED'], RUNNING:['VERIFYING','RETRY_PENDING','BLOCKED'], VERIFYING:['COMPLETED','RETRY_PENDING','WAITING_APPROVAL','BLOCKED'], WAITING_APPROVAL:['READY','BLOCKED'], COMPLETED:[], RETRY_PENDING:['READY','BLOCKED'], BLOCKED:[]
};
export const RepoSchema = z.string().regex(/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/);
export const SubmitSchema = z.object({repo:RepoSchema, prdPath:z.string().min(1)});
export function canTransition(from:State,to:State):boolean { return transitions[from].includes(to); }
export function assertSafePath(path:string):void {
 const normalized=path.replaceAll('\\','/');
 if (normalized.split('/').some(p=>p==='..') || /(^|\/)(\.github\/workflows|\.env|\.git)(\/|$)/i.test(normalized)) throw new Error('Protected or traversal path');
}
export function assertSafeChange(paths:string[]):void { for(const path of paths) assertSafePath(path); }
export function openStore(path='.asf/state.db') {
 const absolute=resolve(path); mkdirSync(dirname(absolute),{recursive:true});
 const db=new Database(absolute); db.pragma('journal_mode = WAL');
 db.exec(`CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, repo TEXT NOT NULL, prd TEXT NOT NULL, prd_sha256 TEXT NOT NULL, state TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL REFERENCES runs(id), from_state TEXT, to_state TEXT NOT NULL, at TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS idx_runs_state ON runs(state);`);
 return db;
}
export function submit(db:Database.Database,repo:string,prdPath:string) {
 RepoSchema.parse(repo); const prd=readFileSync(prdPath,'utf8'); if(!prd.trim() || Buffer.byteLength(prd)>1024*1024) throw new Error('PRD must be nonempty and <= 1 MiB');
 const {createHash}=requireHash(); const hash=createHash('sha256').update(prd).digest('hex');
 const id=randomUUID(), now=new Date().toISOString();
 db.transaction(()=>{ db.prepare('INSERT INTO runs VALUES (?,?,?,?,?,?,?)').run(id,repo,resolve(prdPath),hash,'PENDING',now,now); db.prepare('INSERT INTO events(run_id,from_state,to_state,at) VALUES (?,?,?,?)').run(id,null,'PENDING',now); })();
 return id;
}
function requireHash(){return {createHash: importedCreateHash};}
import {createHash as importedCreateHash} from 'node:crypto';
export function transition(db:Database.Database,id:string,to:State) {
 return db.transaction(()=>{const row=db.prepare('SELECT state FROM runs WHERE id=?').get(id) as {state:State}|undefined;
 if(!row) throw new Error('Unknown run'); if(!canTransition(row.state,to)) throw new Error(`Invalid transition: ${row.state} -> ${to}`);
 const now=new Date().toISOString(); db.prepare('UPDATE runs SET state=?,updated_at=? WHERE id=?').run(to,now,id);
 db.prepare('INSERT INTO events(run_id,from_state,to_state,at) VALUES (?,?,?,?)').run(id,row.state,to,now);
 });
}
