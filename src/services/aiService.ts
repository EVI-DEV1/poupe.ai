interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}
export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible';
    content: string;
  };
  diagnosis: {
    content: string;
  };
  suggestions: {
    items: string[];
  };
  extraIncome: {
    items: string[];
  };
  investment: {
    items: string[];
  };
  motivation: {
    content: string;
  };
}

const API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY);

const MODEL_NAME = 'gemini-2.5-flash';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const callGeminiAPI = async (prompt: string) => {
 

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

 const body = await response.text();

   if (!response.ok) {
  console.error('Erro Gemini:', response.status, body);

  switch (response.status) {
    case 429:
      throw new Error(
        '🤖 Limite de uso da IA atingido. Tente novamente em alguns minutos.'
      );

    case 503:
      throw new Error(
        '🤖 Serviço de IA temporariamente indisponível. Tente novamente mais tarde.'
      );

    case 401:
      throw new Error(
        '🤖 Erro de autenticação da IA. Verifique a chave da API.'
      );

      case 403:
  throw new Error(
    '🤖 Acesso à IA indisponível no momento.'
  );

    default:
      throw new Error(
        '🤖 Não foi possível gerar a resposta no momento. Tente novamente.'
      );
  }
}
    return JSON.parse(body) as GeminiResponse;
  } catch (error) {
    console.error('FETCH ERROR:', error);
    throw error;
  }
  
};
export const getInsight = async (prompt: string) => {
  const response = await callGeminiAPI(prompt);

  try {
    const json = response.candidates[0].content.parts[0].text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(json) as InsightData;
  } catch {
    throw new Error(
      '🤖 Não foi possível interpretar a resposta da IA.'
    );
  }
};
export const askQuestion = async (prompt: string) => {
  const response = await callGeminiAPI(prompt);

  return response.candidates[0].content.parts[0].text
    .replace(/\*\*/g, '')
    .replace(/###/g, '')
    .replace(/##/g, '');
};

  
