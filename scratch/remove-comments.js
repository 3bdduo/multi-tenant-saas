const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const dir = path.join(__dirname, '../src');

function getFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
         arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getFiles(dir);

let modifiedCount = 0;
let commentsRemoved = 0;

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false);
  scanner.setText(code);
  
  let token = scanner.scan();
  const commentsToStrip = [];
  
  while (token !== ts.SyntaxKind.EndOfFileToken) {
    if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) {
      const start = scanner.getTokenPos();
      const end = scanner.getTextPos();
      const commentText = code.substring(start, end);
      
      // Clean comment to count words
      let cleanText = commentText.replace(/^\/\*+/, '').replace(/\*+\/$/, '').replace(/^\/\//, '').trim();
      const words = cleanText.split(/\s+/).filter(w => w.length > 0 && w !== '*');
      
      if (words.length > 2) {
        commentsToStrip.push({ start, end });
      }
    }
    token = scanner.scan();
  }
  
  if (commentsToStrip.length > 0) {
    let newCode = code;
    for (let i = commentsToStrip.length - 1; i >= 0; i--) {
      const { start, end } = commentsToStrip[i];
      // Keep whitespace around it, just remove the comment text
      newCode = newCode.substring(0, start) + newCode.substring(end);
    }
    
    fs.writeFileSync(file, newCode, 'utf8');
    modifiedCount++;
    commentsRemoved += commentsToStrip.length;
  }
});

console.log(`Finished processing. Modified ${modifiedCount} files, removed ${commentsRemoved} comments.`);
