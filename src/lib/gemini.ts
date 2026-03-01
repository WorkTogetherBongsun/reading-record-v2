import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp" // 2.5 flash가 출시 전일 경우 최신 flash 모델 사용
});

export const polishText = async (text: string) => {
  if (!apiKey) throw new Error("API Key is missing");
  
  const prompt = `당신은 감성적이고 풍성한 글쓰기를 돕는 에세이 작가입니다. 
  다음 문장을 바탕으로, 문맥을 파악하여 훨씬 더 시적이고 깊이 있는 에세이 문체로 확장해서 다시 써주세요.
  너무 길지 않게 한두 문장 정도로 다듬어주세요.
  
  입력 문장: "${text}"
  
  변환된 문장:`;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};
