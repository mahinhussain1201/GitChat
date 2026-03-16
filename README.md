# RepoMind Setup Instructions

Follow these steps to run RepoMind locally.

## Prerequisites
- Python 3.10+
- Node.js & npm
- Git
- Groq API Key

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root with the following content:
   ```env
   GROQ_API_KEY=your_groq_api_key
   ```

5. Run the backend server from the project root:
   ```bash
   # Make sure you are in the GitBot root directory
   uvicorn backend.app.main:app --reload
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Using RepoMind

1. Open your browser to the frontend URL (usually `http://localhost:5173`).
2. Paste a GitHub repository link in the input field.
3. Click "Analyze Repo".
4. Once analyzed, use the dashboard to chat with the codebase or generate summaries.
