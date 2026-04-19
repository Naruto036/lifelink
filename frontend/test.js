import http from "http";

http.createServer((req, res) => {
  res.write("Server working");
  res.end();
}).listen(5000);

console.log("SERVER RUNNING AT https://lifelink-4.onrender.com");