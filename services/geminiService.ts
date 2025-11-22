import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateObjectiveSuggestions = async (
  jobTitle: string,
  experienceSummary: string
): Promise<string[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Aja como um consultor de carreira especialista.
      Escreva 3 opções de "Objetivo Profissional" curtas, diretas e impactantes (máximo 3 linhas cada) para um currículo.
      
      Perfil do candidato:
      Cargo desejado/atual: ${jobTitle}
      Resumo da experiência/habilidades: ${experienceSummary}
      
      Retorne APENAS as 3 opções em formato de lista simples, sem numeração ou texto introdutório. Separe-as por quebras de linha duplas.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    const text = response.text;
    if (!text) return [];

    // Split by double newlines and clean up
    return text.split(/\n\n+/).map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Error generating objectives:", error);
    throw new Error("Falha ao gerar sugestões. Tente novamente.");
  }
};
