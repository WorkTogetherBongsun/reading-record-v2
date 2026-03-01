import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  // 클라이언트 사이드(브라우저)에서 로컬 스토리지 확인
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key') || "";
  }
  return "";
};

export const polishText = async (text: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing. Please set it in your profile.");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `당신은 감성적이고 풍성한 글쓰기를 돕는 에세이 작가입니다. 
  다음 문장을 바탕으로, 문맥을 파악하여 훨씬 더 시적이고 깊이 있는 에세이 문체로 확장해서 다시 써주세요.
  너무 길지 않게 한두 문장 정도로 다듬어주세요.
  
  입력 문장: "${text}"
  
  변환된 문장:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
};
