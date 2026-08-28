const http = require('http');

async function testJobsApi() {
    console.log("=== STARTING JOBS API TESTS ===");

    // First login
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "password" })
    });
    const cookie = loginRes.headers.get("set-cookie");
    if (!cookie) {
        console.error("Login failed. Check DB for test user.");
        return;
    }

    async function runTest(url, testName) {
        console.log(`\n--- ${testName} ---`);
        console.log(`GET ${url}`);
        const res = await fetch(`http://localhost:5000${url}`, {
            headers: { "Cookie": cookie }
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        if (data.success && data.data && data.data.jobs) {
            console.log(`Success: true, Returned jobs: ${data.data.jobs.length}`);
            if (data.data.pagination) {
                console.log(`Pagination: Page ${data.data.pagination.page} / ${data.data.pagination.pages} (Total: ${data.data.pagination.total})`);
            }
        } else {
            console.log(data);
        }
        return data;
    }

    await runTest("/api/jobs?source=All&page=1&limit=10", "TEST 1: All page 1");
    await runTest("/api/jobs?source=All&page=2&limit=10", "TEST 2: All page 2");
    await runTest("/api/jobs?source=adzuna&page=1&limit=10", "TEST 3: Adzuna");
    await runTest("/api/jobs?source=arbeitnow&page=1&limit=10", "TEST 4: Arbeitnow");
    await runTest("/api/jobs?source=remotive&page=1&limit=10", "TEST 5: Remotive");

    console.log("\n=== TESTS COMPLETE ===");
}

testJobsApi();
