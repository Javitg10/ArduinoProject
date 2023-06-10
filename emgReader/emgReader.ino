const int emgPin = A5;
void setup() {
  Serial.begin(9600);
}

void loop() {
  int emgValue = analogRead(emgPin);
  Serial.println(emgValue);
  delay(500);
}
