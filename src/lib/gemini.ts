import { GoogleGenerativeAI } from "@google/generative-ai";

const getApiKey = () => {
  if (typeof window !== 'undefined') {
    const key = localStorage.getItem('gemini_api_key');
    return key || "";
  }
  return "";
};

export interface AiFeedback {
  compliment: string;
  improvement: string;
  suggestion: string;
}

export const polishText = async (text: string) => {
  const feedback = await getSentenceFeedback(text);
  return feedback.suggestion;
};

export const getSentenceFeedback = async (text: string): Promise<AiFeedback> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key가 설정되지 않았습니다. 우측 상단 프로필 아이콘을 눌러 키를 저장해주세요.");
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // 요청하신 gemini-2.0-flash-lite-preview-02-05 모델 사용 (가장 가볍고 효율적인 최신 모델)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });

    const prompt = `당신은 작가의 글쓰기를 돕는 전문 에세이 편집자입니다. 
    사용자가 작성한 문장을 분석하여 따뜻하고 지적인 피드백을 제공해주세요. 
    반드시 아래의 JSON 형식으로만 답변하세요. 마크다운 기호(예: \`\`\`json)를 포함하지 말고 순수 JSON 텍스트만 출력하세요.

    {
      "compliment": "문장에서 느껴지는 감정이나 표현 중 훌륭한 점 한 줄",
      "improvement": "글의 흐름이나 단어 선택에서 아쉬운 점이나 깊이를 더할 수 있는 방향 한 줄",
      "suggestion": "이 내용을 바탕으로 새롭게 제안하는 완성도 높은 문장"
    }

    입력된 문장: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    const cleanedText = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    throw new Error(`AI 통신 오류: ${err.message || "알 수 없는 오류가 발생했습니다."}`);
  }
};
