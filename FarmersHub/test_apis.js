const http = require('http');

const ANIVET_URL = 'http://localhost:5000';
const NODEAPP_URL = 'http://localhost:8080/api';

async function testEndpoint(name, url, options = {}) {
    try {
        console.log(`[TESTING] ${name} -> ${options.method || 'GET'} ${url}`);
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });
        
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : await response.text();
        
        if (response.ok) {
            console.log(`✅ [SUCCESS] ${name} - Status: ${response.status}`);
            return { success: true, data };
        } else {
            console.error(`❌ [FAILED] ${name} - Status: ${response.status}\nError:`, data);
            return { success: false, data };
        }
    } catch (err) {
        console.error(`❌ [ERROR] ${name} - Exception: ${err.message}`);
        return { success: false, error: err.message };
    }
}

async function runTests() {
    let passed = 0;
    let failed = 0;

    const report = (res) => res.success ? passed++ : failed++;

    console.log("====== STARTING ANIVET BACKEND TESTS ======");
    // Anivet
    report(await testEndpoint('AniVet Health', `${ANIVET_URL}/health`));
    report(await testEndpoint('AniVet Stats', `${ANIVET_URL}/api/stats`));
    report(await testEndpoint('AniVet Animals', `${ANIVET_URL}/api/animals`));
    report(await testEndpoint('AniVet Sample', `${ANIVET_URL}/api/sample`));
    
    // Embed requires some text
    report(await testEndpoint('AniVet Embed', `${ANIVET_URL}/api/embed`, {
        method: 'POST',
        body: JSON.stringify({ text: 'fever in cow' })
    }));

    // Search
    report(await testEndpoint('AniVet Search', `${ANIVET_URL}/api/search`, {
        method: 'POST',
        body: JSON.stringify({ query: 'fever in cow' })
    }));

    console.log("\n====== STARTING NODEAPP BACKEND TESTS ======");
    // Note: auth endpoints might require valid payloads, testing basic ones
    report(await testEndpoint('Medicines GetAll', `${NODEAPP_URL}/medicine/getAllMedicines`));
    report(await testEndpoint('Feeds GetAll', `${NODEAPP_URL}/feed/getAllFeeds`));
    report(await testEndpoint('Livestock GetAll', `${NODEAPP_URL}/livestock/getAllLivestock`));
    
    // Auth Test Sign up / Login
    const mockUser = {
        userName: 'TestUser',
        email: `test${Date.now()}@test.com`,
        password: 'password123',
        role: 'Owner',
        mobile: '1234567890',
        location: 'Test Location'
    };
    
    const signupRes = await testEndpoint('User Signup', `${NODEAPP_URL}/users/signup`, {
        method: 'POST',
        body: JSON.stringify(mockUser)
    });
    report(signupRes);

    if (signupRes.success) {
        const loginRes = await testEndpoint('User Login', `${NODEAPP_URL}/users/login`, {
            method: 'POST',
            body: JSON.stringify({ email: mockUser.email, password: mockUser.password, role: mockUser.role })
        });
        report(loginRes);
        
        let token = '';
        if (loginRes.data && loginRes.data.token) {
             token = loginRes.data.token;
             console.log("Logged in and got token.");
        }

        // Test auth routes if applicable
        if (token) {
           report(await testEndpoint('My Requested (Requires Auth)', `${NODEAPP_URL}/request/owner/all`, {
               headers: { 'Authorization': `Bearer ${token}` }
           }));
        }
    }

    console.log("\n====== TEST SUMMARY ======");
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
}

runTests();
