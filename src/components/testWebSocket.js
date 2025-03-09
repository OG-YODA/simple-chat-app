import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socket = new SockJS("http://192.168.2.100:8080/ws");

const stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (msg) => console.log(msg),
    onConnect: (frame) => {
        console.log("Connected: " + frame);
        stompClient.subscribe("/topic/notifications", (notification) => {
            console.log("Получено уведомление:", JSON.parse(notification.body));
        });
    },
    onStompError: (frame) => {
        console.error("Ошибка STOMP:", frame);
    },
    onDisconnect: () => {
        console.log("Отключение от WebSocket");
    }
});

// Активируем подключение (однократно, без переподключения)
stompClient.activate();

export function testWebSocketTestConnection() {
    if (!stompClient.connected) {
        console.warn("Соединение с WebSocket отсутствует");
        return;
    }
    const message = "Hello";
    stompClient.publish({
        destination: "/app/notifications/test",
        body: JSON.stringify({ message })
    });
}

// Функция для отключения вручную
export function disconnectWebSocket() {
    if (stompClient.active) {
        stompClient.deactivate();
        console.log("WebSocket отключен вручную");
    }
}

export function showResult(result) {
    console.log("Результат:", result);
}