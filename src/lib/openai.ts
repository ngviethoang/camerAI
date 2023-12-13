import axios from 'axios';

export const createChatCompletion = async (openaiKey: string, model: string, messages: any[], maxTokens?: number) => {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model, messages, max_tokens: maxTokens || 300,
  }, {
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    }
  })
  return response
}