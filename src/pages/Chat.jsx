import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CHAT_API_URL =
  `${import.meta.env.VITE_CHAT_API_URL}/api/chat`;

const SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 22,
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const INITIAL_MESSAGE =
  "Hi, I'm MINDO, your AI counselling chatbot. I’m here to help you talk through your thoughts, feelings, stress, and other wellbeing concerns. We can explore what you’re experiencing step by step, and I can also suggest practical ways to manage and improve things. What would you like to talk about today?";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: INITIAL_MESSAGE,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    const previousMessages = messages;

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: previousMessages.map((item) => ({
            role: item.role,
            content: item.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Chat server error ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();

      const answer =
        data.answer ||
        data.response ||
        data.message ||
        data.reply;

      if (!answer) {
        throw new Error(
          "The chat server returned no answer."
        );
      }

      const mindoMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: answer,
      };

      setMessages((current) => [
        ...current,
        mindoMessage,
      ]);
    } catch (error) {
      console.error(
        "MINDO CHAT ERROR:",
        error
      );

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 2,
          role: "assistant",
          content:
            "I'm sorry, I couldn't connect to Mindo right now. Please make sure the Chat backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  /* =====================================================
     KEYBOARD
  ===================================================== */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  /* =====================================================
     NEW CHAT
  ===================================================== */

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: INITIAL_MESSAGE,
      },
    ]);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  return (
    /*
      IMPORTANT:
      No bg-bg here.

      The global AmbientBackground from SiteLayout
      needs to remain visible behind this page.
    */
    <div className="min-h-screen px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="
            mb-5
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div className="flex items-center gap-3">

            {/* Back button */}

            <Link
              to="/dashboard"
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-white/70
                bg-white/55
                text-lg
                text-ink-soft
                shadow-[0_6px_22px_-12px_rgba(70,60,140,0.22)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:border-white
                hover:bg-white/75
                hover:text-ink
                active:scale-95
              "
              title="Back to dashboard"
            >
              ←
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className="
                    font-mono
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-primary
                  "
                >
                  Mindo chat
                </span>
              </div>

              <h1
                className="
                  mt-0.5
                  font-display
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-ink
                  sm:text-3xl
                "
              >
                Chat with Mindo
              </h1>

              <p className="mt-0.5 text-sm text-ink-soft">
                A private space to talk, reflect, and be heard.
              </p>
            </div>
          </div>

          {/* New Chat */}

          <motion.button
            type="button"
            onClick={clearChat}
            disabled={loading}
            whileHover={{
              y: -1,
            }}
            whileTap={{
              scale: 0.97,
            }}
            transition={SPRING}
            className="
              shrink-0
              rounded-full
              border
              border-white/75
              bg-white/60
              px-4
              py-2
              text-xs
              font-medium
              text-ink-soft
              shadow-[0_6px_22px_-12px_rgba(70,60,140,0.18)]
              backdrop-blur-xl
              transition-[background-color,color,opacity]
              duration-300
              hover:bg-white/80
              hover:text-ink
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            New Chat
          </motion.button>
        </motion.div>

        {/* =====================================================
            CHAT WINDOW
        ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 22,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            ease: "easeOut",
          }}
          className="
            mx-auto
            flex
            h-[calc(100vh-175px)]
            min-h-[520px]
            max-w-5xl
            flex-col
            overflow-hidden
            rounded-[28px]
            border
            border-white/70
            bg-white/42
            shadow-[0_24px_70px_-30px_rgba(47,39,110,0.28)]
            backdrop-blur-2xl
            backdrop-saturate-150
          "
        >
          {/* =================================================
              CHAT HEADER
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-b
              border-white/55
              bg-white/20
              px-5
              py-4
              backdrop-blur-xl
              sm:px-6
            "
          >
            <div className="flex items-center gap-3">

              {/* Mindo avatar */}

              <div
                className="
                  relative
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-white/70
                  bg-white/65
                  shadow-[0_5px_20px_-10px_rgba(91,79,207,0.25)]
                "
              >
                <img
                  src="/images/logo.png"
                  alt="Mindo"
                  className="h-9 w-9 rounded-full"
                />

                <span
                  className="
                    absolute
                    right-0.5
                    top-0.5
                    h-2.5
                    w-2.5
                    rounded-full
                    border-2
                    border-white
                    bg-emerald-400
                  "
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="
                      font-display
                      text-sm
                      font-semibold
                      text-ink
                    "
                  >
                    Mindo
                  </h2>

                  <span
                    className="
                      rounded-full
                      bg-primary/8
                      px-2
                      py-0.5
                      font-mono
                      text-[8px]
                      uppercase
                      tracking-[0.1em]
                      text-primary-deep
                    "
                  >
                    AI
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-ink-soft">
                  AI wellbeing companion
                </p>
              </div>
            </div>

            <div
              className="
                hidden
                items-center
                gap-2
                sm:flex
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <span
                className="
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.12em]
                  text-ink-soft/60
                "
              >
                Online
              </span>
            </div>
          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-4
              py-6
              sm:px-6
            "
          >
            <div
              className="
                mx-auto
                max-w-3xl
                space-y-5
              "
            >
              {messages.map((message) => {
                const isUser =
                  message.role === "user";

                return (
                  <motion.div
                    key={message.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className={`
                      flex
                      ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex
                        max-w-[88%]
                        items-end
                        gap-2
                        sm:max-w-[76%]
                        ${
                          isUser
                            ? "flex-row-reverse"
                            : "flex-row"
                        }
                      `}
                    >
                      {!isUser && (
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            border
                            border-white/60
                            bg-white/60
                          "
                        >
                          <img
                            src="/images/logo.png"
                            alt=""
                            className="h-7 w-7 rounded-full"
                          />
                        </div>
                      )}

                      <div
                        className={`
                          rounded-2xl
                          px-4
                          py-3
                          text-sm
                          leading-6
                          shadow-[0_6px_20px_-14px_rgba(47,39,110,0.22)]
                          ${
                            isUser
                              ? "rounded-br-md bg-gradient-primary text-white"
                              : "rounded-bl-md border border-white/55 bg-white/62 text-ink backdrop-blur-xl"
                          }
                        `}
                      >
                        {message.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="flex justify-start"
                >
                  <div className="flex items-end gap-2">

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        border
                        border-white/60
                        bg-white/60
                      "
                    >
                      <img
                        src="/images/logo.png"
                        alt=""
                        className="h-7 w-7 rounded-full"
                      />
                    </div>

                    <div
                      className="
                        rounded-2xl
                        rounded-bl-md
                        border
                        border-white/55
                        bg-white/62
                        px-4
                        py-3
                        backdrop-blur-xl
                      "
                    >
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/55" />

                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/55"
                          style={{
                            animationDelay: "0.15s",
                          }}
                        />

                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/55"
                          style={{
                            animationDelay: "0.3s",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* =================================================
              INPUT AREA
          ================================================= */}

          <div
            className="
              shrink-0
              border-t
              border-white/55
              bg-white/20
              p-4
              backdrop-blur-xl
              sm:p-5
            "
          >
            <div className="mx-auto max-w-3xl">

              <div
                className="
                  flex
                  items-end
                  gap-2
                  rounded-2xl
                  border
                  border-white/65
                  bg-white/55
                  p-2
                  shadow-[0_8px_28px_-16px_rgba(70,60,140,0.20)]
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  focus-within:border-primary/30
                  focus-within:bg-white/70
                  focus-within:shadow-[0_10px_32px_-14px_rgba(91,79,207,0.22)]
                "
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  rows={1}
                  placeholder="Talk to Mindo..."
                  className="
                    max-h-32
                    min-h-[44px]
                    flex-1
                    resize-none
                    bg-transparent
                    px-3
                    py-2.5
                    text-sm
                    leading-6
                    text-ink
                    outline-none
                    placeholder:text-ink-soft/65
                    disabled:cursor-not-allowed
                  "
                />

                <motion.button
                  type="button"
                  onClick={sendMessage}
                  disabled={
                    loading ||
                    !input.trim()
                  }
                  whileHover={
                    !loading && input.trim()
                      ? {
                          scale: 1.04,
                        }
                      : {}
                  }
                  whileTap={
                    !loading && input.trim()
                      ? {
                          scale: 0.96,
                        }
                      : {}
                  }
                  transition={SPRING}
                  className="
                    flex
                    h-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-primary
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-[0_8px_22px_-12px_rgba(91,79,207,0.55)]
                    transition-opacity
                    duration-200
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-35
                  "
                >
                  {loading ? "..." : "Send"}
                </motion.button>
              </div>

              <p
                className="
                  mt-3
                  text-center
                  font-mono
                  text-[9px]
                  leading-5
                  tracking-wide
                  text-ink-soft/55
                "
              >
                Mindo provides general wellbeing support and
                is not a replacement for professional care.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}