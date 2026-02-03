# 🎭 Sentiment & Tone Analyzer with Reply Generator

An AI-powered sentiment analysis tool that detects sentiment, tone, and emotions in text messages, and generates appropriate reply suggestions using advanced language models.

## ✨ Features

- **Real-time Sentiment Analysis**: Detects positive, negative, or neutral sentiment with confidence scores
- **Tone Detection**: Identifies the tone of messages (professional, casual, aggressive, friendly, etc.)
- **Emotion Recognition**: Breaks down detected emotions (happy, sad, angry, fearful, surprised, etc.)
- **AI Reply Generation**: Generates contextually appropriate replies using Groq AI
- **Beautiful UI**: Modern, glassmorphic design with smooth animations
- **Copy to Clipboard**: Easy copying of generated replies

## 🏗️ Project Structure

```
sentiment-analyzer/
├── backend/                    # FastAPI Backend
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── models/
│   │   └── analyzer.py        # Sentiment analysis logic
│   └── utils/
│       └── llm_client.py      # Groq API integration
│
├── frontend/                   # Next.js Frontend
│   ├── package.json
│   ├── next.config.js
│   ├── app/
│   │   ├── page.js            # Main application page
│   │   ├── layout.js          # Root layout
│   │   └── globals.css        # Global styles
│   └── components/
│       ├── MessageInput.js    # Text input component
│       ├── SentimentMeter.js  # Sentiment visualization
│       ├── AnalysisResult.js  # Results display
│       └── CopyButton.js      # Copy functionality
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 18+
- Groq API Key ([Get it here](https://console.groq.com))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768
GROQ_TEMPERATURE=0.3
GROQ_MAX_TOKENS=1024
```

5. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 API Documentation

### Analyze Endpoint

**POST** `/analyze`

Analyzes the sentiment and tone of a message.

**Request Body:**
```json
{
  "message": "Your message here",
  "generate_reply": true
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "confidence": 0.92,
  "tone": "professional",
  "emotions": {
    "happy": 0.8,
    "satisfied": 0.6,
    "calm": 0.4
  },
  "suggested_reply": "Thank you for your message..."
}
```

## 🎨 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Groq AI**: Lightning-fast LLM inference
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Beautiful icons

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Your Groq API key | Required |
| `GROQ_MODEL` | LLM model to use | `mixtral-8x7b-32768` |
| `GROQ_TEMPERATURE` | Sampling temperature | `0.3` |
| `GROQ_MAX_TOKENS` | Max response tokens | `1024` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## 📝 Usage

1. Enter your message in the text area
2. Optionally check "Generate suggested reply"
3. Click "Analyze Sentiment" or press `Cmd/Ctrl + Enter`
4. View the sentiment analysis, tone detection, and emotion breakdown
5. If enabled, see the AI-generated suggested reply
6. Click "Copy" to copy the suggested reply to clipboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Powered by [Groq](https://groq.com) for ultra-fast AI inference
- Built with [Next.js](https://nextjs.org) and [FastAPI](https://fastapi.tiangolo.com)
- Icons by [Lucide](https://lucide.dev)

---

Made with ❤️ using AI-powered sentiment analysis