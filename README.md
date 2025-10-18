# AI Professional Development Coach for Educators

An intelligent system that provides personalized professional development recommendations for teachers based on their profiles, goals, and constraints.

## 🧰 Tech Stack

- **Backend**: Python (FastAPI)
- **Frontend**: React + TailwindCSS
- **AI Orchestration**: LangChain (Python)
- **Vector Store**: FAISS for semantic search
- **Embeddings + LLM**: Groq API
- **Database**: MongoDB

## 🚀 Features

1. **Educator Profile Input** - Collect teacher information, goals, and constraints
2. **Resource Knowledge Base** - Store and manage PD resources (workshops, tools, articles)
3. **AI Processing Pipeline** - Match resources using embeddings and generate personalized recommendations
4. **Modern Frontend** - Responsive React dashboard with TailwindCSS
5. **Admin Panel** - Upload and manage resources

## 📁 Project Structure

```
project/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic
│   │   ├── database/       # MongoDB connection
│   │   └── utils/          # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   └── utils/         # Utility functions
│   ├── package.json       # Node dependencies
│   └── tailwind.config.js # TailwindCSS config
└── README.md              # This file
```

## 🔧 Setup

### Backend Setup
1. Navigate to the backend directory
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Unix)
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in your API keys
6. Run: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## 🔐 Environment Variables

- `GROQ_API_KEY` - Your Groq API key
- `MONGO_URI` - MongoDB connection string

## 📝 Example Flow

1. Teacher enters profile (subject, grade, goals, constraints)
2. Backend retrieves matching resources using vector search
3. Groq LLM generates personalized coaching message and actionable steps
4. Frontend displays recommendations with resource cards