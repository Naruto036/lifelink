import http from "http";

http.createServer((req, res) => {
  res.write("Server working");
  res.end();
}).listen(5000);

console.log("Server running at http://localhost:5000");