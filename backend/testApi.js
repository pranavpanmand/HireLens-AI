const test = async () => {
    try {
        const body = JSON.stringify({ email: "test@test.com", password: "password" });
        console.log("Logging in...");
        const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body
        });
        const data = await res.json();
        
        const cookie = res.headers.get("set-cookie");
        if (cookie) {
            console.log("Fetching jobs...");
            const jobsRes = await fetch("http://localhost:5000/api/jobs?source=All&page=1&limit=10", {
                headers: { "Cookie": cookie }
            });
            const jobsData = await jobsRes.json();
            
            const jobId = jobsData.data.jobs[0]._id;
            console.log("Analyzing job ID:", jobId);

            const matchRes = await fetch(`http://localhost:5000/api/matches/job/${jobId}`, {
                method: "POST",
                headers: { "Cookie": cookie }
            });
            const matchData = await matchRes.json();
            console.log("Match response:", JSON.stringify(matchData, null, 2));
        } else {
            console.log("No cookie returned!");
        }
    } catch (e) {
        console.error(e);
    }
};
test();
