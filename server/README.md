# Kai backend

The backend protects the Ollama Cloud API key and independently fetches Open-Meteo data before asking Kai to interpret it.

1. Copy `.env.example` to `.env` and add your Ollama Cloud key.
2. Load the variables in your shell, then run `node server/index.mjs`.
3. Set `EXPO_PUBLIC_KAI_API_URL` in the Expo development environment to the backend origin, such as `http://192.168.1.10:8787` for a physical phone on the same network.

Never put `OLLAMA_API_KEY` in Expo environment variables or mobile code. Production must use HTTPS and server-side authentication in front of this endpoint.
