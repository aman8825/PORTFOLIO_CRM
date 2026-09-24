const testMessages = async () => {
  const baseUrl = 'http://localhost:5000/api/messages';

  console.log('--- 1. Testing Valid Submission ---');
  let res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: 'John Doe', 
      email: 'john@example.com',
      subject: 'Test automated message',
      message: 'Hello, this is a test from the backend script.'
    })
  });
  let data = await res.json();
  console.log('Status:', res.status, 'Data:', data);

  console.log('\n--- 2. Testing Missing Fields ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      name: 'John Doe', 
      // missing email
      subject: 'Test',
      message: 'Test'
    })
  });
  data = await res.json();
  console.log('Status:', res.status, 'Data:', data);

  console.log('\n--- 3. Verify in Admin (Requires Auth) ---');
  console.log('Please log in via the React admin UI to view the seeded messages, verify read/unread status, and test the email reply composer manually.');
};

testMessages();
