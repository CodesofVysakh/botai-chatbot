import { useContext, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Stack } from "@mui/material";
import InitialChat from "../../components/InitialChat/InitialChat";
import ChatInput from "../../components/ChatInput/ChatInput";
import ChattingCard from "../../components/ChattingCard/ChattingCard";
import FeedbackModal from "../../components/FeedbackModal/FeedbackModal";
import Navbar from "../../components/Navbar/Navbar";
import { ThemeContext } from "../../theme/ThemeContext";
import { sendMessage } from "../../services/chatService";

export default function Home() {
    const [showModal, setShowModal] = useState(false);
    const listRef = useRef(null);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [scrollToBottom, setScrollToBottom] = useState(false);
    const { chat, setChat } = useOutletContext();
    const { mode } = useContext(ThemeContext);

    const generateResponse = async (input) => {
        const userId = crypto.randomUUID();
        const aiId = crypto.randomUUID();
        const userMessage = {
            type: "Human",
            text: input,
            time: new Date().toISOString(),
            id: userId,
        };
        const aiPlaceholder = {
            type: "AI",
            text: "Thinking...",
            time: new Date().toISOString(),
            id: aiId,
        };

        setChat((prev) => [...prev, userMessage, aiPlaceholder]);

        try {
            const messageHistory = [...chat, userMessage].map((item) => ({
                role: item.type === "Human" ? "user" : "assistant",
                content: item.text,
            }));

            const answer = await sendMessage(messageHistory, input);

            setChat((prev) =>
                prev.map((item) =>
                    item.id === aiId
                        ? { ...item, text: answer || "Sorry, no response was returned." }
                        : item
                )
            );
        } catch (error) {
            setChat((prev) =>
                prev.map((item) =>
                    item.id === aiId
                        ? {
                              ...item,
                              text: "Sorry, I am unable to respond right now. Please try again.",
                          }
                        : item
                )
            );
        }
    };

    useEffect(() => {
        listRef.current?.lastElementChild?.scrollIntoView();
    }, [scrollToBottom]);

    return (
        <Stack
            height={"100vh"}
            justifyContent={"space-between"}
            sx={{
                "@media (max-width:767px)": {
                    background:
                        mode === "light"
                            ? "linear-gradient(#F9FAFA 60%, #EDE4FF)"
                            : "",
                },
            }}
        >
            <Navbar />

            {chat.length === 0 && (
                <InitialChat generateResponse={generateResponse} />
            )}

            {chat.length > 0 && (
                <Stack
                    height={1}
                    flexGrow={0}
                    p={{ xs: 2, md: 3 }}
                    spacing={{ xs: 2, md: 3 }}
                    sx={{
                        overflowY: "auto",
                        "&::-webkit-scrollbar": {
                            width: "10px",
                        },
                        "&::-webkit-scrollbar-track": {
                            boxShadow: "inset 0 0 8px rgba(0,0,0,0.1)",
                            borderRadius: "8px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "rgba(151, 133, 186,0.4)",
                            borderRadius: "8px",
                        },
                    }}
                    ref={listRef}
                >
                    {chat.map((item, index) => (
                        <ChattingCard
                            details={item}
                            key={item.id || index}
                            updateChat={setChat}
                            setSelectedChatId={setSelectedChatId}
                            showFeedbackModal={() => setShowModal(true)}
                        />
                    ))}
                </Stack>
            )}

            <ChatInput
                generateResponse={generateResponse}
                setScroll={setScrollToBottom}
                chat={chat}
                clearChat={() => setChat([])}
            />

            <FeedbackModal
                open={showModal}
                updateChat={setChat}
                chatId={selectedChatId}
                handleClose={() => setShowModal(false)}
            />
        </Stack>
    );
}
