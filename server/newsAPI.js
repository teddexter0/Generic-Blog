import express from "express";
import fetch from "node-fetch";
import NodeCache from "node-cache";

// Initialize in-memory cache with a 3-minute TTL
const cache = new NodeCache({ stdTTL: 180 });

const newsAPI = express.Router();

// Fetch news data from the NewsAPI
const fetchNews = async (endpoint = "top-headlines", page = 1, query = "") => {
  const baseUrl = `https://newsapi.org/v2/${endpoint}`;
  const apiKey = process.env.NEWS_API_KEY;
  const url = new URL(baseUrl);

  // Append query parameters
  url.searchParams.append("apiKey", apiKey);
  url.searchParams.append("page", page);
  url.searchParams.append("pageSize", 6); // Limit to 6 articles per page

  if (query) {
    url.searchParams.append("q", query); // Specific search query
  } else {
    url.searchParams.append("country", "us"); // Default to US top headlines
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
    const page = parseInt(req.query.page, 10) || 1;
    const query = req.query.query || ""; // Use query if provided
    const refresh = req.query.refresh === "true"; // Check if refresh is requested

    let articles;

    if (refresh) {
      console.log("Refreshing articles...");
      articles = await fetchNews("top-headlines", page, query);
      cache.set("articles", articles); // Update cache with fresh data
    } else {
      articles = cache.get("articles");

      if (!articles) {
        console.log("Fetching new articles...");
        articles = await fetchNews(
          query ? "everything" : "top-headlines",
          page,
          query
        );
        cache.set("articles", articles); // Cache for 3 minutes
      } else {
        console.log("Using cached articles...");
      }
    }

    res.render("trends", { articles, currentPage: page, query });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).render("trends", {
      articles: articles.map((article) => ({
        title: article.title || "No Title Available",
        description: article.description || "No Description Available",
        url: article.url || "#",
        urlToImage: article.urlToImage || "https://via.placeholder.com/150",
        author: article.author || "Unknown Author",
      })),
      currentPage: page,
      query,
    });
  }
});

export default newsAPI;
