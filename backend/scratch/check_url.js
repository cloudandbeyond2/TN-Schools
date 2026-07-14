const http = require("http");

const req = http.request("http://localhost:5000/uploads/1784006624566-10th_English_Text.pdf", { method: "HEAD" }, (res) => {
  console.log("STATUS:", res.statusCode);
  console.log("HEADERS:", res.headers);
});

req.on("error", (e) => {
  console.error("ERROR CONNECTING:", e.message);
});

req.end();
