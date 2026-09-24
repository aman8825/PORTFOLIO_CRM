const testAuth = async () => {
  const baseUrl = 'http://localhost:5000/api/auth';
  let cookie;

  console.log('--- 1. Testing Invalid Login ---');
  let res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpassword' })
  });
  let data = await res.json();
  console.log('Status:', res.status, 'Data:', data);

  console.log('\n--- 2. Testing Unauthorized Request ---');
  res = await fetch(`${baseUrl}/me`);
  data = await res.json();
  console.log('Status:', res.status, 'Data:', data);

  console.log('\n--- 3. Testing Valid Login ---');
  res = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
  });
  const setCookie = res.headers.get('set-cookie');
  cookie = setCookie ? setCookie.split(';')[0] : null;
  data = await res.json();
  console.log('Status:', res.status, 'Data:', data);
  console.log('Received Cookie:', cookie ? 'Yes' : 'No');

  console.log('\n--- 4. Testing Protected Endpoint ---');
  res = await fetch(`${baseUrl}/me`, {
    headers: { 'Cookie': cookie }
  });
  data = await res.json();
  console.log('Status:', res.status, 'Data:', data);

  console.log('\n--- 5. Testing Logout ---');
  res = await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers: { 'Cookie': cookie }
  });
  const logoutCookie = res.headers.get('set-cookie');
  data = await res.json();
  console.log('Status:', res.status, 'Data:', data);
  console.log('Cleared Cookie:', logoutCookie ? 'Yes' : 'No');

  console.log('\n--- 6. Testing Protected Endpoint After Logout ---');
  res = await fetch(`${baseUrl}/me`, {
    headers: { 'Cookie': logoutCookie.split(';')[0] }
  });
  data = await res.json();
  console.log('Status:', res.status, 'Data:', data);
};

testAuth();
