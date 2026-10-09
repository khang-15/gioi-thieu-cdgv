import { spawn } from 'node:child_process';
import { dirname,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
if(Number(process.versions.node.split('.')[0])<24){console.error('Cần Node.js 24 trở lên.');process.exit(1);}
const children=['backend/src/server.mjs','frontend/server.mjs'].map(file=>spawn(process.execPath,[resolve(root,file)],{stdio:'inherit',cwd:root}));
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)child.kill();process.exitCode=code;}
for(const child of children)child.on('exit',code=>stop(code||0));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>stop());
