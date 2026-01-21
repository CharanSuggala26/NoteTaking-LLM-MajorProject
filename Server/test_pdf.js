const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

async function test() {
    console.log('Testing pdf-parse...');
    try {
        // Create a dummy PDF buffer (this won't be a valid PDF, but pdf-parse might throw a specific error or we can try to require it at least)
        // Better: just check if it is a function
        console.log('Type of pdfParse:', typeof pdfParse);

        if (typeof pdfParse !== 'function') {
            console.error('pdf-parse is NOT a function!');
        } else {
            console.log('pdf-parse IS a function.');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

test();
