const fs = require('fs');
const path = require('path');

async function testUpload() {
    console.log("1. Logging in...");
    const loginRes = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "password" })
    });
    
    const cookie = loginRes.headers.get("set-cookie");
    if (!cookie) {
        console.error("Login failed:", await loginRes.text());
        return;
    }
    console.log("Login successful.");

    console.log("\n2. Uploading dummy resume...");
    const form = new FormData();
    // A tiny valid PDF file buffer (1-page empty PDF)
    const pdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCj4+CiAgPj4KICAvQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8CiAgL1R5cGUgL0ZvbnQKICAvU3VidHlwZSAvVHlwZTExCiAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgo+PgplbmRvYmoKCjUgMCBvYmoKPDwgL0xlbmd0aCAyMSA+PgpzdHJlYW0KQlQKMDw8CjAvRjEgMjQKVEwKMzAKVGYKKFRlc3QpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDc5IDAwMDAwIG4gCjAwMDAwMDAxNzMgMDAwMDAgbiAKMDAwMDAwMDMwMSAwMDAwMCBuIAowMDAwMDAwMzgwIDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ1MgolJUVPRgo=";
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    form.append('resume', blob, 'test-resume.pdf');
    
    const uploadRes = await fetch("http://127.0.0.1:5000/api/resumes/upload", {
        method: "POST",
        headers: { "Cookie": cookie },
        body: form
    });
    const result = await uploadRes.text();
    console.log("Resume Upload Result:", result);
}

testUpload();
