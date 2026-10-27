#!/usr/bin/env node
import { Command } from 'commander';
import { openStore, submit, transition, states } from './core.js';
const program=new Command().name('asf').description('AI Software Factory Sprint 1 CLI').version('0.1.0');
program.command('init').action(()=>{const db=openStore();db.close();console.log('Initialized local state');});
program.command('submit').argument('<prd>').requiredOption('--repo <owner/name>').action((prd,opts)=>{const db=openStore();try{console.log(submit(db,opts.repo,prd));}finally{db.close();}});
program.command('status').argument('<run-id>').action(id=>{const db=openStore();try{const row=db.prepare('SELECT id,repo,state,prd_sha256,created_at,updated_at FROM runs WHERE id=?').get(id);if(!row)throw new Error('Unknown run');console.log(JSON.stringify(row,null,2));}finally{db.close();}});
program.command('transition').argument('<run-id>').requiredOption('--to <state>').action((id,opts)=>{if(!states.includes(opts.to))throw new Error('Unknown state');const db=openStore();try{transition(db,id,opts.to);}finally{db.close();}});
program.parseAsync().catch(err=>{console.error(err.message);process.exitCode=1;});
