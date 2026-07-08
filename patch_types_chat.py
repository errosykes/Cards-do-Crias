import sys
with open('src/types.ts', 'r') as f:
    content = f.read()

chat_message_type = """export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface GameState {"""

content = content.replace("export interface GameState {", chat_message_type)
content = content.replace("  rematchGameId?: string;", "  rematchGameId?: string;\n  chatMessages?: ChatMessage[];")

with open('src/types.ts', 'w') as f:
    f.write(content)
print("done")
