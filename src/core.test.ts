import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {canTransition,assertSafeChange,openStore,submit,transition} from './core.js';
test('state machine rejects unauthorized transition',()=>{assert.equal(canTransition('PENDING','COMPLETED'),false);assert.equal(canTransition('PENDING','READY'),true);});
test('protected paths and traversal rejected',()=>{for(const p of ['.github/workflows/ci.yml','../secrets','.env','.git/config','src/../../etc/passwd'])assert.throws(()=>assertSafeChange([p]));assert.doesNotThrow(()=>assertSafeChange(['src/api.ts']));});
test('submit persists state and transition audit',()=>{const dir=mkdtempSync(join(tmpdir(),'asf-'));try{const file=join(dir,'prd.md');writeFileSync(file,'# Example PRD');const db=openStore(join(dir,'state.db'));const id=submit(db,'aungkoman/demo',file);assert.throws(()=>transition(db,id,'COMPLETED'));transition(db,id,'READY');const row=db.prepare('SELECT state FROM runs WHERE id=?').get(id) as {state:string};assert.equal(row.state,'READY');const count=db.prepare('SELECT count(*) AS n FROM events WHERE run_id=?').get(id) as {n:number};assert.equal(count.n,2);db.close();}finally{rmSync(dir,{recursive:true,force:true});}});
