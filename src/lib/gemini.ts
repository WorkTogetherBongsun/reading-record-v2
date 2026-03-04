import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || "";
  }
  return "";
};

export interface AiFeedback {
  compliment: string;
  improvement: string;
  suggestion: string;
}

// 기존 polishText 기능을 대체하거나 호환성을 위해 유지
export const polishText = async (text: string) => {
  const feedback = await getSentenceFeedback(text);
  return feedback.suggestion;
};

export const getSentenceFeedback = async (text: string): Promise<AiFeedback> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key가 없습니다. 설정에서 등록해주세요.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `당신은 작가의 글쓰기를 돕는 전문 편집자입니다. 
  다음 문장을 분석하여 작가에게 영감을 주는 피드백을 제공해주세요. 
  반드시 아래의 JSON 형식으로만 답변하세요.

  {
    "compliment": "문장에서 느껴지는 감정이나 표현 중 훌륭한 점 한 줄",
    "improvement": "글의 흐름이나 단어 선택에서 아쉬운 점이나 깊이를 더할 수 있는 방향 한 줄",
    "suggestion": "이 내용을 바탕으로 새롭게 제안하는 완성도 높은 문장"
  }

  입력된 문장: "${text}"`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const cleanedText = response.text().replace(/```json|```/g, "").trim();
  return JSON.parse(cleanedText);
};
