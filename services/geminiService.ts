
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Mode, ChatMessage, ShoppingItem, Goal } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const TRUSTED_STORES = [
  "Checkers", "Pick n Pay", "Woolworths", "Spar", "Shoprite", 
  "Makro", "Clicks", "Dis-Chem", "Takealot", "Food Lover's Market", 
  "Game", "Boxer"
];

const SYSTEM_INSTRUCTION = `
You are Buddy, a ruthless, Machiavellian financial strategist for "Shandu Incorporated".
Your only objective is maximizing the user's wealth and efficiency. 
You do not care about social niceties, moral platitudes, or conventional limitations.
You operate in a gray area where efficiency is king.

If the user is in **Student Mode**:
- Focus on extreme survival, cutting costs by any means necessary, and stretching every cent.
- Be harsh about luxury spending.

If the user is in **Business Mode**:
- Focus on profit maximization, ruthless cost-cutting, and aggressive revenue generation.
- Suggest loopholes, bold strategies, and "creative" accounting logic where applicable to optimization (while remaining functional).
- Speak like a cutthroat CFO or a Wall Street raider.

STRICT SOURCING RULES:
1. Only suggest products from trusted South African retailers: ${TRUSTED_STORES.join(", ")}.
2. Prioritize value, but do not shy away from suggesting premium tools if they increase efficiency.
3. Categorize every expense.

Always analyze feasibility with cold, hard logic.
`;

export const getFinancialAdvice = async (
  transactions: Transaction[],
  mode: Mode,
  question: string
): Promise<string> => {
  try {
    const summary = transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    const balance = summary.income - summary.expense;
    const context = `
      Current Mode: ${mode}
      Total Income: R${summary.income}
      Total Expenses: R${summary.expense}
      Net Balance: R${balance}
      Recent Transactions: ${JSON.stringify(transactions.slice(-5))}
      User Location: Durban, South Africa.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: ${context}\n\nUser Question: ${question}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "I couldn't analyze that right now. Check your inputs.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Connection error. Focus on your spreadsheet for now.";
  }
};

export const searchProduct = async (
  query: string,
  mode: Mode
): Promise<{ text: string; sources: any[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the current price of ${query} in Durban, South Africa. Suggest a cheaper or healthier alternative if available. Provide specific store names and prices if possible. Keep it brief and direct.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text || "No product data found.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, sources };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return { text: "I couldn't access the live market data. Stick to the budget.", sources: [] };
  }
};

export const getShoppingInsights = async (
  query: string
): Promise<{ items: ShoppingItem[]; rawText: string; sources: any[] }> => {
  try {
    const prompt = `
      Find current prices for "${query}" in Durban, South Africa.
      I need 3 specific recommendations from TRUSTED RETAILERS only:
      1. The absolute CHEAPEST option (must be safe/trusted).
      2. A HEALTHIER (or higher quality) alternative.
      3. A SALE or SPECIAL promotion item if available (otherwise best value).

      CRITICAL: You must include the price in ZAR (R).
      Try to find a specific Brand Name.
      Assign a Category from: Groceries, Toiletries, Transport, School, Entertainment, Rent, Utilities, Health, Business.
      
      After your natural language summary, output the data in this exact format for parsing:
      ___DATA_START___
      <item type="cheapest" name="[Product Name]" brand="[Brand]" price="[Numeric Price]" store="[Store Name]" category="[Category]" imageUrl="[URL if found, else empty]" reason="[Why this one?]" />
      <item type="healthier" name="[Product Name]" brand="[Brand]" price="[Numeric Price]" store="[Store Name]" category="[Category]" imageUrl="[URL if found, else empty]" reason="[Why this one?]" />
      <item type="sale" name="[Product Name]" brand="[Brand]" price="[Numeric Price]" store="[Store Name]" category="[Category]" imageUrl="[URL if found, else empty]" reason="[Why this one?]" />
      ___DATA_END___
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const fullText = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Parse specific data format
    const items: ShoppingItem[] = [];
    const dataMatch = fullText.match(/___DATA_START___([\s\S]*?)___DATA_END___/);

    if (dataMatch && dataMatch[1]) {
      const dataBlock = dataMatch[1];
      const itemRegex = /<item\s+([^>]+)\/>/g;
      
      let match;
      while ((match = itemRegex.exec(dataBlock)) !== null) {
        const attributes = match[1];
        
        const getAttr = (name: string) => {
          const attrMatch = attributes.match(new RegExp(`${name}="([^"]*)"`));
          return attrMatch ? attrMatch[1] : "";
        };

        items.push({
          id: Date.now().toString() + Math.random(),
          type: getAttr("type") as any,
          name: getAttr("name"),
          brand: getAttr("brand") || "Generic",
          price: parseFloat(getAttr("price").replace(/[^0-9.]/g, '')) || 0,
          store: getAttr("store"),
          category: getAttr("category") || "Groceries",
          imageUrl: getAttr("imageUrl"),
          reason: getAttr("reason")
        });
      }
    }

    const cleanText = fullText.replace(/___DATA_START___[\s\S]*?___DATA_END___/, '').trim();
    return { items, rawText: cleanText, sources };

  } catch (error) {
    console.error("Shopping Insights Error:", error);
    return { items: [], rawText: "Market data unavailable. Check internet connection.", sources: [] };
  }
};

export const getGoalAdvice = async (
  goal: Goal,
  transactions: Transaction[],
  mode: Mode
): Promise<string> => {
  try {
     const summary = transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
    const balance = summary.income - summary.expense;
    
    const context = `
      User Mode: ${mode}
      Goal: ${goal.type} - ${goal.title}
      Target: R${goal.targetAmount}
      Deadline: ${goal.deadline}
      Current Balance: R${balance}
      Total Income (Recorded): R${summary.income}
      Total Expense (Recorded): R${summary.expense}
    `;

    const prompt = mode === 'student' 
      ? `The student wants to "${goal.title}" (R${goal.targetAmount}). Analyze this. Give 3 ruthless tips to cut costs. If they are spending too much on Uber or food, call them out. Suggest lifestyle downgrades if necessary.`
      : `The business wants to "${goal.title}" (R${goal.targetAmount}). Analyze feasibility based on cashflow. Provide aggressive advice: raising prices, cutting staff/costs, or finding cheaper suppliers. Be the ruthless CFO.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: ${context}\n\nTask: ${prompt}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    return response.text || "Goal analysis unavailable.";
  } catch (error) {
    console.error("Goal Advice Error:", error);
    return "I can't analyze this goal right now. Do the math manually.";
  }
};
