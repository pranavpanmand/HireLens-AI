async function testAdvancedSearch() {
    const BASE = "http://127.0.0.1:5000/api";
    
    // Login first
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "password" })
    });
    const cookie = loginRes.headers.get("set-cookie");
    console.log("Login:", loginRes.ok ? "✅" : "❌");

    const tests = [
        { name: "Basic jobs", url: "/jobs?page=1&limit=5" },
        { name: "Search: python", url: "/jobs?search=python&page=1&limit=5" },
        { name: "Location: remote", url: "/jobs?location=remote&page=1&limit=5" },
        { name: "Location: Delhi", url: "/jobs?location=Delhi&page=1&limit=5" },
        { name: "Source: Adzuna", url: "/jobs?source=Adzuna&page=1&limit=5" },
        { name: "Combined: python+remote", url: "/jobs?search=python&location=remote&page=1&limit=5" },
        { name: "Sort: recent", url: "/jobs?sort=recent&page=1&limit=5" },
    ];

    for (const test of tests) {
        try {
            const res = await fetch(`${BASE}${test.url}`);
            const data = await res.json();
            const count = data.data?.pagination?.total || 0;
            console.log(`${test.name}: ${res.ok ? "✅" : "❌"} (${count} results)`);
        } catch (err) {
            console.log(`${test.name}: ❌ ERROR: ${err.message}`);
        }
    }

    // Test that profile still works
    try {
        const profileRes = await fetch(`${BASE}/profile`, { headers: { Cookie: cookie } });
        console.log(`Profile API: ${profileRes.ok ? "✅" : "❌"}`);
    } catch (err) {
        console.log(`Profile API: ❌ ${err.message}`);
    }
}

testAdvancedSearch();
