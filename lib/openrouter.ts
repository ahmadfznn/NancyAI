import axios from "axios";

const API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const sendChat = async (msg: string, tone = "calm and romantic") => {
  const res = await axios.post(
    API_URL,
    {
      model: "llama3.1",
      messages: [
        { role: "user", content: `Respond in a ${tone} tone:\n${msg}` },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0].message.content;
};
