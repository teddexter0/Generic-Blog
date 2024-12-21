import express from "express";
import fetch from "node-fetch";
import NodeCache from "node-cache";

// Initialize in-memory cache with a 5-minute TTL (Time To Live)
const cache = new NodeCache({ stdTTL: 180 }); // 3 minutes

const newsAPI = express.Router();

// Fetch news data from the NewsAPI
const fetchNews = async (page = 1, query = "") => {
  const baseUrl = "https://newsapi.org/v2/everything"; // Use 'everything' endpoint for broader search
  const apiKey = "cb1267ffaf314d19938062978c85a05f";
  const url = new URL(baseUrl);

  // Append query parameters
  url.searchParams.append("apiKey", apiKey);
  url.searchParams.append("page", page);
  url.searchParams.append("pageSize", 6); // Limit to 6 articles per page

  if (query) {
    url.searchParams.append("q", query); // Search specific topics
  } else {
    url.searchParams.append("q", "latest"); // Default query for general topics
  }

  // Fetch data from the NewsAPI
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  const newsData = await response.json();
  return newsData.articles; // Return articles
};

// Define the /trends route
newsAPI.get("/trends", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const query = req.query.query || ""; // Default to no search query

    // Check if articles are in the cache
    let articles = cache.get("articles");

    if (!articles) {
      // If not cached, fetch and cache the data
      console.log("Fetching new articles...");
      articles = await fetchNews(page, query);
      cache.set("articles", articles); // Cache for 5 minutes
    } else {
      console.log("Using cached articles...");
    }

    res.render("trends", { articles, currentPage: page, query });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).render("trends", {
      articles: [],
      currentPage: 1,
      query: "",
      errorMessage: "Failed to load news. Please try again later.",
    });
  }
});

export default newsAPI;
