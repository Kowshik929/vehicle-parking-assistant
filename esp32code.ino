#include <WiFi.h>
#include <WebSocketsServer.h>

// WiFi credentials
const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";

// WebSocket server
WebSocketsServer webSocket = WebSocketsServer(81);

// Ultrasonic sensor pins
const int trigPin1 = 5;
const int echoPin1 = 18;
const int trigPin2 = 19;
const int echoPin2 = 21;

// Function to measure distance
long measureDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  long distance = (duration * 0.034 / 2);
  return distance;
}

void setup() {
  Serial.begin(115200);

  // Initialize ultrasonic sensors
  pinMode(trigPin1, OUTPUT);
  pinMode(echoPin1, INPUT);
  pinMode(trigPin2, OUTPUT);
  pinMode(echoPin2, INPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WebSocket server started");
}

void loop() {
  // Measure distances
  long distance1 = measureDistance(trigPin1, echoPin1);
  long distance2 = measureDistance(trigPin2, echoPin2);

  // Send data to WebSocket clients
  String jsonData = "{\"distance1\":" + String(distance1) + ",\"distance2\":" + String(distance2) + "}";
  webSocket.broadcastTXT(jsonData);

  // Handle WebSocket communication
  webSocket.loop();
  delay(500);
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.println("Client connected");
  } else if (type == WStype_DISCONNECTED) {
    Serial.println("Client disconnected");
  }
}
