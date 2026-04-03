import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { method, query, url, headers } = req;

  // Extract only important headers
  const importantHeaders = {
    "user-agent": headers["user-agent"],
    "x-forwarded-for": headers["x-forwarded-for"] || req.socket.remoteAddress,
    "host": headers["host"],
    "accept": headers["accept"],
  };

  const requestLog = {
    method,
    url,
    query,
    headers: importantHeaders,
    cookies: headers.cookie,
    referer: headers.referer,
    origin: headers.origin,
  };
  
  if (method !== "GET") {
    requestLog.bodyPreview = req.body ? JSON.stringify(req.body) : null;
  }
  
  console.log("Request received:", requestLog);

  // Path to HTML file
  const filePath = path.join(process.cwd(), "public", "site.html");

  if (!fs.existsSync(filePath)) {
    console.error("HTML file not found:", filePath);
    console.log("Response:", {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      bodyPreview: "HTML file missing",
    });
    return res.status(500).send("HTML file missing");
  }

  try {
    const html = fs.readFileSync(filePath, "utf-8");

    // Set headers to **prevent caching**
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache"); // HTTP/1.0 backward compatibility
    res.setHeader("Expires", "0");       // Expire immediately

    // Log the response before sending
    console.log("Response:", {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      bodyPreview: html,
    });
    
    res.status(200).send(html);
  } catch (err) {
    console.error("Error reading HTML:", err);
    console.log("Response:", {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      bodyPreview: "Server error",
    });
    res.status(500).send("Server error");
  }
}
