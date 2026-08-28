const http = require('http');

async function testMatch() {
    console.log("Logging in...");
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "password" })
    });
    
    const cookie = loginRes.headers.get("set-cookie");
    if (!cookie) {
        console.error("Login failed:", await loginRes.text());
        return;
    }

    const jobId = "6a91a9ec29026af31d47528e";
    console.log(`Analyzing job ID: ${jobId}`);
    
    const matchRes = await fetch(`http://localhost:5000/api/matches/job/${jobId}`, {
        method: "POST",
        headers: { "Cookie": cookie }
    });
    
    console.log("Status:", matchRes.status);
    const text = await matchRes.text();
    console.log("Response text:", text);
}

testMatch();
