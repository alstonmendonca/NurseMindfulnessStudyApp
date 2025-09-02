const fs = require('fs');
const path = require('path');

// Read the markdown file
const markdownPath = path.join(__dirname, '..', 'docs', 'Shanthi_App_Blueprint.md');
const markdownContent = fs.readFileSync(markdownPath, 'utf8');

// Create HTML version with proper styling for Word
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Shanthi App Blueprint</title>
    <style>
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
            color: #333;
        }
        h1 {
            color: #2c5aa0;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 10px;
            font-size: 28px;
            text-align: center;
        }
        h2 {
            color: #2c5aa0;
            border-bottom: 2px solid #e1e5e9;
            padding-bottom: 8px;
            margin-top: 30px;
            font-size: 22px;
        }
        h3 {
            color: #4a90e2;
            margin-top: 25px;
            font-size: 18px;
        }
        h4 {
            color: #666;
            margin-top: 20px;
            font-size: 16px;
        }
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        ul, ol {
            margin-bottom: 15px;
            padding-left: 25px;
        }
        li {
            margin-bottom: 5px;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
        }
        pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
        }
        blockquote {
            border-left: 4px solid #2c5aa0;
            margin: 15px 0;
            padding-left: 15px;
            font-style: italic;
            color: #555;
        }
        hr {
            border: 0;
            height: 2px;
            background: linear-gradient(to right, transparent, #2c5aa0, transparent);
            margin: 30px 0;
        }
        .executive-summary {
            background-color: #f0f7ff;
            border: 1px solid #2c5aa0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .highlight-box {
            background-color: #fff9e6;
            border-left: 4px solid #ffa500;
            padding: 15px;
            margin: 15px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e1e5e9;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
${markdownContent
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
    .replace(/^\*(.*?)\*/gm, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/gm, '<p>')
    .replace(/$/gm, '</p>')
    .replace(/<p><li>/g, '<ul><li>')
    .replace(/<\/li><\/p>/g, '</li></ul>')
    .replace(/<p><hr><\/p>/g, '<hr>')
    .replace(/<p><h([1-4])>/g, '<h$1>')
    .replace(/<\/h([1-4])><\/p>/g, '</h$1>')
}
</body>
</html>
`;

// Write HTML file
const htmlPath = path.join(__dirname, '..', 'docs', 'Shanthi_App_Blueprint.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ HTML version created successfully!');
console.log('📄 File location:', htmlPath);
console.log('');
console.log('📝 To create DOCX:');
console.log('1. Open the HTML file in a web browser');
console.log('2. Press Ctrl+A to select all content');
console.log('3. Copy the content (Ctrl+C)');
console.log('4. Open Microsoft Word');
console.log('5. Paste the content (Ctrl+V)');
console.log('6. Save as DOCX format');
console.log('');
console.log('🌟 The document includes:');
console.log('   • Complete app blueprint and technical specifications');
console.log('   • Research framework and data collection details');
console.log('   • User experience design and features');
console.log('   • Future development roadmap');
console.log('   • Professional formatting suitable for documentation');
