const axios = require('axios');

/**
 * @desc    Get AI-powered effort + due date estimate for a task
 * @route   POST /api/ai/suggest
 * @access  Private
 *
 * SECURITY: The Gemini API key is stored in backend .env ONLY.
 * It is never exposed to the browser/frontend.
 */
const suggestEstimate = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        success: true,
        aiAvailable: false,
        message: 'AI feature is not configured. Please add GEMINI_API_KEY to server .env',
        data: null,
      });
    }

    const prompt = `You are a project management assistant. Given a task title and description, suggest:
1. An effort estimate (use T-shirt sizes: XS = <1hr, S = 1-3hrs, M = 3-8hrs, L = 8-24hrs, XL = >24hrs)
2. A recommended due date (from today: ${new Date().toISOString().split('T')[0]})
3. A short reasoning (max 2 sentences)

Task Title: ${title}
Task Description: ${description || 'No description provided'}

Respond ONLY with a valid JSON object in this exact format (no markdown, no explanation outside JSON):
{
  "effortEstimate": "M",
  "effortHours": "3-8 hours",
  "suggestedDueDate": "YYYY-MM-DD",
  "reasoning": "Short 1-2 sentence reasoning here."
}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        },
      },
      {
        timeout: 15000, // 15 second timeout
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Extract the text from Gemini response
    const rawText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the JSON from the AI response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI returned an unexpected response format');
    }

    const aiData = JSON.parse(jsonMatch[0]);

    // Validate the parsed data
    if (!aiData.effortEstimate || !aiData.suggestedDueDate) {
      throw new Error('AI response missing required fields');
    }

    res.status(200).json({
      success: true,
      aiAvailable: true,
      message: 'Estimate generated successfully',
      data: {
        effortEstimate: aiData.effortEstimate,
        effortHours: aiData.effortHours || '',
        suggestedDueDate: aiData.suggestedDueDate,
        reasoning: aiData.reasoning || '',
      },
    });
  } catch (error) {
    // Graceful fallback — AI errors should not break the app
    console.error('AI Service Error:', error.message);

    // Check specific error types for better user messages
    let userMessage = 'AI estimate is temporarily unavailable. You can set values manually.';

    if (error.response?.status === 429) {
      userMessage = 'AI rate limit reached. Please try again in a moment.';
    } else if (error.response?.status === 403) {
      userMessage = 'AI service configuration error. Please contact support.';
    } else if (error.code === 'ECONNABORTED') {
      userMessage = 'AI request timed out. Please try again.';
    }

    res.status(200).json({
      success: true,
      aiAvailable: false,
      message: userMessage,
      data: null,
    });
  }
};

module.exports = { suggestEstimate };
