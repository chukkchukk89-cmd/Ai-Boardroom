const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
  res.send('AI Boardroom backend server is running.');
});

// This endpoint will securely handle the AI agent logic
app.post('/api/run-agent', async (req, res) => {
    const { objective, agents, uploadedFiles, maestroId } = req.body;

    // For simplicity, this example will just use the objective and the first agent.
    // A full implementation would use the maestro logic from the frontend.
    if (!objective || !agents || agents.length === 0) {
        return res.status(400).send('Missing objective or agents in request.');
    }

    try {
        // This is a simplified version of the logic found in `useSimulation.ts`
        const agent = agents[0]; // Using the first agent for this example
        const model = genAI.getGenerativeModel({ model: agent.model.modelName });

        const fileContext = uploadedFiles.map(f => `### ${f.fileName}\n${f.content}`).join('\n\n');
        const prompt = `Objective: ${objective}\n\nRelevant Files:\n${fileContext}`;

        const result = await model.generateContentStream(prompt);

        // Stream the response back to the client
        res.setHeader('Content-Type', 'application/json');
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            // Each chunk is sent as a JSON object on a new line
            res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
        }
        res.end();

    } catch (error) {
        console.error('Error calling Generative AI API:', error);
        res.status(500).send('An error occurred while processing the AI request.');
    }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
