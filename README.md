# Weekly Budget Report automation generator

## About

This branch of [n8n-workflows](https://github.com/adomas399/n8n-workflows) is specifically made to generate a weekly n8n budget report workflow.
The automation:

- Uses an [actual-mcp](https://github.com/adomas399/actual-mcp) sse instance to extract the users budget data
- Generates a report based on a prompt `input/budgetReviewPrompt.txt`
- Sends said report via email to the recipient

All necessary setup can be made from the terminal or by manually setting the envirnoment variables – no coding needed! For a more tailored report, customize the prompt.

## Usage

### Prerequisities

- [Node.js](https://nodejs.org/en/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (optional)
- [actual-mcp](https://github.com/adomas399/actual-mcp)

### Execution

1.  Clone the repository:

    ```bash
    git clone --single-branch --branch budget-report https://github.com/adomas399/n8n-workflows.git
    cd n8n-workflows
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Setup the envirnonment variables

    a) Following the guided setup script

    ```bash
    npm run setup
    ```

    or

    b) Creating a and filling an `.env` file manually

    ```bash
    cp .env.example .env
    ```

    ```bash
    # --- Required ---
    N8N_URL=https://your-n8n-instance.com            # Your n8n instance URL
    N8N_API_KEY=your-n8n-api-key                     # Your n8n API key
    LLM_PROVIDER=OpenRouter                          # Model provider (OpenRouter|OpenAi|Anthropic|etc.)
    LLM_PROVIDER_CREDENTIAL_ID=abc-123               # n8n credential ID for the model provider
    RESEND_CREDENTIAL_ID=def-456                     # n8n credential ID for Resend
    MAIL_FROM=send@email.example                     # Sender email address
    MAIL_TO=receive@email.example                    # Recipient email address
    OVERWRITE=true                                   # Whether to replace existing workflows
    MCP_ENDPOINT=https://your-actual-mcp-url/sse     # Actual-MCP SSE endpoint URL

    # --- Optional (if your MCP SSE instance doens't have authentication) ---
    MCP_AUTHENTICATION=bearerAuth                    # Authentication type (bearerAuth|headerAuth)
    MCP_CREDENTIAL_ID=ghi-789                        # n8n credential ID for MCP (if authentication enabled)

    # --- Optional with defaults ---
    CHAT_MODEL=anthropic/claude-3.7-sonnet           # Default chat model
    WORKFLOW_NAME=Weekly Budget Report               # Default workflow name
    WEEK_DAY=Sunday                                  # Default execution day
    HOUR=21                                          # Default execution hour
    ```

4.  Execute

    a) Using Node.js

    Simply run:

    ```bash
    npm run start
    ```

    b) Using Docker

    1. Build the image:

       ```bash
       docker build -t local-image . --load
       ```

    2. Run the image:

       ```bash
       docker run local-image
       ```

    c) Using GitHub Actions

    Run Action 'Push N8N Workflow' on Github

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
