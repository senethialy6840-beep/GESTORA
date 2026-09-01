async function testLogin() {
  try {
    const res = await fetch("http://localhost:3000/api/auth/csrf");
    const { csrfToken } = await res.json();

    const loginRes = await fetch("http://localhost:3000/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": res.headers.get("set-cookie") || "",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        csrfToken,
        email: "admin@gestora.sn",
        password: "admin",
        redirect: "false"
      }).toString()
    });

    const data = await loginRes.text();
    console.log("Status:", loginRes.status);
    console.log("Response Text:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

testLogin();
