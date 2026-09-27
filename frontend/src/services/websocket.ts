type EventCallback = (data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectInterval = 3000;
  private url: string = '';

  connect(clientType: 'dashboard' | 'counselor', clientId?: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // In dev with Vite proxy or direct port 8000
    const endpoint = clientType === 'counselor' && clientId 
      ? `/ws/counselor/${clientId}`
      : '/ws/dashboard';

    this.url = `${protocol}//${host}${endpoint}`;

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log(`[WS Connected] Connected as ${clientType} (${clientId || 'all'})`);
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const eventType = payload.event || payload.type;
          const data = payload.data || payload;

          if (eventType && this.listeners.has(eventType)) {
            this.listeners.get(eventType)?.forEach(cb => cb(data));
          }

          // Also trigger general wildcard listener
          if (this.listeners.has('*')) {
            this.listeners.get('*')?.forEach(cb => cb({ event: eventType, data }));
          }
        } catch (e) {
          console.error('[WS Parse Error]', e);
        }
      };

      this.socket.onclose = () => {
        console.log('[WS Closed] Reconnecting in 3s...');
        setTimeout(() => this.connect(clientType, clientId), this.reconnectInterval);
      };

      this.socket.onerror = (err) => {
        console.warn('[WS Error]', err);
      };
    } catch (err) {
      console.warn('Could not establish WebSocket connection. Operating in HTTP polling mode:', err);
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsClient = new WebSocketClient();
