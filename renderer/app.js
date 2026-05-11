/**
 * Symdy Desktop — renderer process.
 * Chat UI that communicates with pi via the preload bridge.
 */

const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

let isStreaming = false;
let currentAssistantEl = null;
let streamingContent = '';
let cleanup = null;

// ── Init ────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
  // Listen for pi events
  cleanup = window.symdy.onEvent(handlePiEvent);

  // Check status
  window.symdy.getStatus().then(status => {
    if (status.connected) setConnected(true);
  });

  // Input handling
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

// ── Pi Event Handler ────────────────────────────────────────────────────

function handlePiEvent(event) {
  switch (event.type) {
    case 'status':
      setConnected(true);
      addStatus(event.message);
      break;

    case 'error':
      addStatus('⚠ ' + event.message);
      setConnected(false);
      break;

    case 'log':
      // Internal logs, show only in dev
      break;

    case 'response':
      // RPC command response — message accepted
      break;

    case 'assistant':
      // Assistant message (streaming or final)
      handleAssistantEvent(event);
      break;

    case 'tool_call':
      // Tool call started
      addStatus('🔧 ' + (event.toolName || 'working') + '...');
      break;

    case 'tool_result':
      // Tool completed — remove status, let assistant continue
      break;

    case 'message':
      // Generic message event
      if (event.role === 'assistant' && event.content) {
        finishStreaming();
        addAssistantMessage(formatContent(event.content));
      }
      break;

    default:
      // Unknown event, log in dev
      break;
  }
}

function handleAssistantEvent(event) {
  // If this is a streaming delta
  if (event.delta) {
    if (!isStreaming) {
      startStreaming();
    }
    streamingContent += event.delta;
    updateStreamingContent(streamingContent);
  }
  // If this is a complete message
  else if (event.content && !event.delta) {
    finishStreaming();
    addAssistantMessage(formatContent(event.content));
  }
}

// ── Send Message ────────────────────────────────────────────────────────

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text || isStreaming) return;

  inputEl.value = '';
  sendBtn.disabled = true;

  addUserMessage(text);
  const result = await window.symdy.send(text);

  if (!result.success) {
    addStatus('⚠ ' + (result.error || 'Failed to send'));
    sendBtn.disabled = false;
  }
}

// ── Message Rendering ───────────────────────────────────────────────────

function addUserMessage(text) {
  const el = document.createElement('div');
  el.className = 'message msg-user';
  el.innerHTML = `<div class="msg-content">${escapeHtml(text)}</div>`;
  messagesEl.appendChild(el);
  scrollDown();
}

function addAssistantMessage(html) {
  const el = document.createElement('div');
  el.className = 'message msg-assistant';
  el.innerHTML = `<div class="msg-content">${html}</div>`;
  messagesEl.appendChild(el);
  scrollDown();
}

function addStatus(text) {
  const el = document.createElement('div');
  el.className = 'message msg-status';
  el.textContent = text;
  messagesEl.appendChild(el);
  scrollDown();

  // Auto-remove status after 5 seconds
  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 5000);
}

function startStreaming() {
  isStreaming = true;
  currentAssistantEl = document.createElement('div');
  currentAssistantEl.className = 'message msg-assistant';
  currentAssistantEl.innerHTML = '<div class="msg-content"></div>';
  messagesEl.appendChild(currentAssistantEl);
}

function updateStreamingContent(text) {
  if (currentAssistantEl) {
    currentAssistantEl.querySelector('.msg-content').innerHTML = formatContent(text);
    scrollDown();
  }
}

function finishStreaming() {
  isStreaming = false;
  currentAssistantEl = null;
  streamingContent = '';
  sendBtn.disabled = false;
}

function formatContent(text) {
  if (!text) return '';
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function scrollDown() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── Status ──────────────────────────────────────────────────────────────

function setConnected(connected) {
  statusDot.className = connected ? 'dot-connected' : 'dot-disconnected';
  statusText.textContent = connected ? 'Symdy' : 'Disconnected';
}
