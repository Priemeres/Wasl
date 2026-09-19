const fs=require('node:fs'); const ts=require('typescript');
const source=ts.createSourceFile('App.tsx',fs.readFileSync('src/App.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX); const out=new Set();
function visit(n){if(ts.isJsxText(n)&&/[\u0600-\u06ff]/.test(n.text))out.add(n.text.trim());if(ts.isStringLiteral(n)&&/[\u0600-\u06ff]/.test(n.text))out.add(n.text);ts.forEachChild(n,visit)}visit(source);console.log(JSON.stringify([...out],null,2));
