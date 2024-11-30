import Header from "./Header.js";
import ChatArea from "./ChatArea.js";
import UserInput from "./UserInput.js";
import { ChatMessage } from "./ChatMessage.js";

document.addEventListener("DOMContentLoaded", () => {
  // 헤더, 채팅 영역, 사용자 입력을 포함하여 앱 초기화
  const app = document.getElementById("app");
  app.innerHTML = `${Header()} ${ChatArea()} ${UserInput()}`;

  const sendBtn = document.getElementById("send-btn");
  const messageInput = document.getElementById("message-input");
  const chatArea = document.getElementById("chat-area");
  const exitImg = document.getElementById("exit");

  function scrollToBottom() {
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  sendBtn.addEventListener("click", () => {
    const messageText = messageInput.value.trim();
    if (messageText) {
      // 사용자 메시지 추가
      const userMessage = ChatMessage({ sender: "user", text: messageText });
      chatArea.insertAdjacentHTML("beforeend", userMessage);
      messageInput.value = "";

      // 서버로 메시지 전송 (message와 variable 함께 전송)
      fetch("http://127.0.0.1:5200/mh_static_chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      })
        .then((response) => {
          if (!response.ok) {
            console.error(
              "서버 응답 오류:",
              response.status,
              response.statusText
            );
            throw new Error(`서버 오류: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("서버 응답 데이터:", data);
          if (data.response === "result") {
            window.location.href = "http://127.0.0.1:5200/graph";
          } else {
            const chatbotMessage = ChatMessage({
              sender: "chatbot",
              text: data.response,
            });
            chatArea.insertAdjacentHTML("beforeend", chatbotMessage);
          }
        })
        .catch((error) => {
          console.error("오류 발생:", error);
          const chatbotMessage = ChatMessage({
            sender: "chatbot",
            text: "오류가 발생했습니다. 다시 시도해 주세요.",
          });
          chatArea.insertAdjacentHTML("beforeend", chatbotMessage);
        });

      scrollToBottom();
    }
  });

  // 카테고리 선택 시 호출할 함수
  window.setValue = function (value) {
    selectedVariable = value; // 선택된 카테고리 값을 전역 변수에 저장
  };

  exitImg.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:6200/logined_index"; // 메인 페이지로 이동
  });

  // 메시지 입력창의 동적 크기 조정
  function adjustTextareaHeight(textarea) {
    textarea.style.height = "auto"; // 높이를 초기화
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      parseInt(getComputedStyle(textarea).maxHeight)
    )}px`; // 높이 조정
  }

  // 초기 상태에서 `textarea`의 높이를 조정하여 기본 상태를 유지
  adjustTextareaHeight(messageInput);

  // `input` 이벤트가 발생할 때마다 `textarea`의 높이 조정
  messageInput.addEventListener("input", () => {
    adjustTextareaHeight(messageInput);
  });

  // 초기 스크롤을 하단으로 이동
  scrollToBottom();
});
