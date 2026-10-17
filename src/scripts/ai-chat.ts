/**
 * AI贴吧老哥 · 聊天交互
 * ----------------------------------------------------------------
 * - 回复规则与旧站 project/ai.html 完全一致：
 *   含「！」→ 孝 / 含「尾号」→ 绷 / 长度 > 10 → 急 / 长度 ≤ 5 → 麻 / 其他 → 典
 * - 纯前端零依赖，不请求任何接口；延迟 600–1000ms 只是「正在输入」的表演
 * - 所有节点用 createElement / textContent 创建，不拼 innerHTML，避免用户输入被当成 HTML
 */

/** 关键词规则，按优先级从高到低匹配 */
function replyTo(message: string): string {
  if (message.includes('！')) return '孝';
  if (message.includes('尾号')) return '绷';
  if (message.length > 10) return '急';
  if (message.length <= 5) return '麻';
  return '典';
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const log = document.querySelector<HTMLElement>('[data-chat-log]');
const form = document.querySelector<HTMLFormElement>('[data-chat-form]');
const input = document.querySelector<HTMLInputElement>('[data-chat-input]');
const empty = document.querySelector<HTMLElement>('[data-chat-empty]');

if (log && form && input) {
  const chatLog = log;
  const chatForm = form;
  const chatInput = input;

  const scrollToBottom = (): void => {
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  /** 追加一条消息气泡（用户右侧 / AI 左侧），返回消息节点 */
  const appendMessage = (text: string, from: 'user' | 'ai'): HTMLElement => {
    if (empty) empty.hidden = true;

    const message = document.createElement('div');
    message.className = `chat-message chat-message--${from}`;

    const avatar = document.createElement('span');
    avatar.className = 'chat-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = from === 'user' ? '🧑' : '🤖';

    const group = document.createElement('span');
    group.className = 'chat-bubble-group';

    const bubble = document.createElement('span');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;

    const time = document.createElement('time');
    time.className = 'chat-time';
    const now = new Date();
    time.dateTime = now.toISOString();
    time.textContent = formatTime(now);

    group.append(bubble, time);
    message.append(avatar, group);
    chatLog.append(message);
    scrollToBottom();
    return message;
  };

  /** 「正在输入」三点动画；aria-hidden，读屏器只播报最终回复 */
  const showTyping = (): HTMLElement => {
    const typing = document.createElement('div');
    typing.className = 'chat-message chat-message--ai chat-typing';
    typing.setAttribute('aria-hidden', 'true');

    const avatar = document.createElement('span');
    avatar.className = 'chat-avatar';
    avatar.textContent = '🤖';

    const dots = document.createElement('span');
    dots.className = 'chat-dots';
    for (let index = 0; index < 3; index += 1) {
      dots.append(document.createElement('span'));
    }

    typing.append(avatar, dots);
    chatLog.append(typing);
    scrollToBottom();
    return typing;
  };

  const send = (): void => {
    const text = chatInput.value.trim();
    if (!text) {
      chatInput.focus();
      return;
    }

    appendMessage(text, 'user');
    chatInput.value = '';

    // 先占位再延迟回复，模拟真实聊天的节奏（600–1000ms）
    const typing = showTyping();
    window.setTimeout(
      () => {
        typing.remove();
        appendMessage(replyTo(text), 'ai');
      },
      600 + Math.random() * 400,
    );

    chatInput.focus();
  };

  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    send();
  });
}

export {};
