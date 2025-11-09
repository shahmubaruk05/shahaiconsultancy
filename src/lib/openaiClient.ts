
  import OpenAI from "openai";

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "OPENAI_API_KEY is not set. Ask Shah real AI replies will not work until this is configured."
    );
  }

  export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
