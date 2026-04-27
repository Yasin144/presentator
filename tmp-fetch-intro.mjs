const files = ['default-intro.mp4','default-intro-optimized.mp4'];
(async()=>{
  for (const file of files) {
    const res = await fetch('http://127.0.0.1:5173/' + file);
    const blob = await res.blob();
    console.log(JSON.stringify({file, ok: res.ok, status: res.status, size: blob.size}));
  }
})();
