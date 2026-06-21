import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const WS_URL = 'ws://10.0.2.2:8080/ws';

export function useAuctionLiveSocket(subastaId, onActiveItemChange) {
  const callbackRef = useRef(onActiveItemChange);
  useEffect(() => { callbackRef.current = onActiveItemChange; });

  useEffect(() => {
    if (!subastaId) return;
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/subasta/${subastaId}`, (message) => {
          try {
            const update = JSON.parse(message.body);
            callbackRef.current?.(update);
          } catch (e) {}
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, [subastaId]);
}

export function useAuctionSocket(itemId, onBidUpdate) {
  const clientRef = useRef(null);

  useEffect(() => {
    if (!itemId) return;

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/item/${itemId}`, (message) => {
          try {
            const update = JSON.parse(message.body);
            onBidUpdate(update);
          } catch (e) {}
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [itemId]);
}
