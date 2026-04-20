fetch('http://127.0.0.1:3001/api/v1/finance/test-cron')
  .then(r => r.json())
  .then(data => console.dir(data, { depth: null }))
  .catch(console.error);
