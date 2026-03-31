import fallbackData from "../data/sampleData.json";

function getFallbackResponse(input) {
    const response = fallbackData.find(
        (item) => input.trim().toLowerCase() === item.question.toLowerCase()
    );

    if (response) {
        return response.response;
    }

    return "Sorry, I did not understand your query.";
}

export async function sendMessage(messages, userInput) {
    const apiUrl = process.env.REACT_APP_CHAT_API_URL;

    if (!apiUrl) {
        return getFallbackResponse(userInput);
    }

    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(process.env.REACT_APP_CHAT_API_KEY
                ? { Authorization: `Bearer ${process.env.REACT_APP_CHAT_API_KEY}` }
                : {}),
        },
        body: JSON.stringify({
            messages,
            input: userInput,
            model: process.env.REACT_APP_CHAT_MODEL || undefined,
        }),
    });

    if (!res.ok) {
        throw new Error(`Chat API request failed: ${res.status}`);
    }

    const payload = await res.json();
    return payload.reply || payload.response || payload.message || "";
}
