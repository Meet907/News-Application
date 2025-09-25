
import axios from 'axios'
import Parser from 'rss-parser'

const parser = new Parser()
const VERIFIED = ['Reuters','Associated Press','BBC News','The New York Times','The Wall Street Journal','Bloomberg']

export default async function handler(req, res) {
  const { category } = req.query
  let articles = []

  try {
    // NewsAPI
    if (process.env.NEWSAPI_KEY) {
      const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&q=${category}&apiKey=${process.env.NEWSAPI_KEY}`
      const newsRes = await axios.get(url)
      const newsArticles = newsRes.data.articles.map((a, i) => ({
        id: `${category}_news_${i}`,
        title: a.title,
        source: a.source?.name,
        publishedAt: a.publishedAt,
        snippet: a.description || a.content || '',
        url: a.url,
        category,
        verified: VERIFIED.includes(a.source?.name),
        credibilityScore: Math.min(1,(a.content||'').length/400)
      }))
      articles.push(...newsArticles)
    }

    // RSS fallback
    const rssFeeds = {
      politics: ['https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml'],
      global: ['https://rss.nytimes.com/services/xml/rss/nyt/World.xml'],
      tech: ['https://techcrunch.com/feed/'],
      ai: ['https://www.technologyreview.com/feed/'],
      immigration: ['https://www.uscis.gov/news/rss-feed/58944'],
      wealth: ['https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_articles']
    }

    if (rssFeeds[category]) {
      for (const feedUrl of rssFeeds[category]) {
        const feed = await parser.parseURL(feedUrl)
        const rssArticles = feed.items.slice(0,5).map((a,i) => ({
          id: `${category}_rss_${i}`,
          title: a.title,
          source: feed.title,
          publishedAt: a.pubDate || new Date().toISOString(),
          snippet: a.contentSnippet || '',
          url: a.link,
          category,
          verified: VERIFIED.includes(feed.title),
          credibilityScore: Math.min(1,(a.contentSnippet||'').length/400)
        }))
        articles.push(...rssArticles)
      }
    }

    res.status(200).json(articles)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}
