fetch("http://localhost:5173/logout", {
  method: "POST",
  redirect: "manual"
}).then(res => {
  console.log("Status:", res.status);
  console.log("Headers:");
  res.headers.forEach((val, key) => console.log(`${key}: ${val}`));
}).catch(console.error);
