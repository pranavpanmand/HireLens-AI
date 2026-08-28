const http = require('http');

async function testProfileAPI() {
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

    console.log("\n2. Getting Profile...");
    const getRes = await fetch("http://127.0.0.1:5000/api/profile", {
        headers: { "Cookie": cookie }
    });
    console.log(await getRes.json());

    console.log("\n3. Updating Basic Info...");
    const putRes = await fetch("http://127.0.0.1:5000/api/profile/basic-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Cookie": cookie },
        body: JSON.stringify({
            firstName: "Test",
            lastName: "User",
            city: "San Francisco",
            github: "https://github.com/test",
            careerPreferences: {
                roles: ["Software Engineer", "Backend Developer"],
                workMode: "Remote"
            }
        })
    });
    const putData = await putRes.json();
    console.log("Updated Basic Info Success:", putData.success);

    console.log("\n4. Updating Education...");
    const eduRes = await fetch("http://127.0.0.1:5000/api/profile/education", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Cookie": cookie },
        body: JSON.stringify({
            education: [{
                degree: "B.Tech",
                institution: "IIIT",
                fieldOfStudy: "Computer Science",
                startYear: "2020",
                endYear: "2024",
                cgpaOrPercentage: "8.5"
            }]
        })
    });
    console.log("Updated Education Success:", (await eduRes.json()).success);
}

testProfileAPI();
