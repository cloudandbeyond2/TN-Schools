async function check() {
  const res = await fetch('https://tn-schools.vercel.app/portal/login');
  const html = await res.text();
  const chunkMatches = html.match(/\/static\/chunks\/[^"']+\.js/g) || [];
  console.log('Found chunks:', chunkMatches.length);
  for (const chunk of chunkMatches) {
    const js = await (await fetch('https://tn-schools.vercel.app/_next' + chunk.replace('/static', '/static'))).text();
    const urls = js.match(/https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/[a-zA-Z0-9_.-]+)*/g) || [];
    const filtered = urls.filter(u => !u.includes('w3.org') && !u.includes('github') && !u.includes('flaticon') && !u.includes('vercel.app'));
    if (filtered.length > 0) {
      console.log('Chunk:', chunk, 'URLs:', filtered);
    }
  }
}
check().catch(console.error);
