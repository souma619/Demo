# Playwright MCP Server Setup

This project includes a Playwright MCP (Model Context Protocol) server that enables AI assistants to automate browser interactions using Playwright.

## Installation

Dependencies are already installed. To verify, run:

```bash
npm install
```

## Starting the MCP Server

Run the MCP server with:

```bash
npm run mcp
```

The server will start and listen on stdio, ready to accept connections from MCP clients.

## Configuration for Claude Desktop

To use the Playwright MCP server with Claude Desktop, add the following to your Claude Desktop configuration file:

**macOS/Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": [
        "/path/to/Demo/mcp-server.js"
      ]
    }
  }
}
```

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": [
        "C:\\path\\to\\Demo\\mcp-server.js"
      ]
    }
  }
}
```

## Available Tools

The MCP server exposes the following tools:

### Browser Management
- **launch_browser**: Launch a browser instance (chromium, firefox, or webkit)
  - Parameters: `browserType` (required), `headless` (optional, default: true)
  - Returns: Browser ID for use in other commands

- **close_browser**: Close a browser instance
  - Parameters: `browserId` (required)

### Page Management
- **new_page**: Open a new page in the browser
  - Parameters: `browserId` (required)
  - Returns: Page ID for use in other commands

- **close_page**: Close a page
  - Parameters: `pageId` (required)

### Navigation & Interaction
- **navigate_to**: Navigate to a URL in a page
  - Parameters: `pageId` (required), `url` (required)

- **click**: Click on an element
  - Parameters: `pageId` (required), `selector` (required)

- **fill**: Fill input field with text
  - Parameters: `pageId` (required), `selector` (required), `text` (required)

- **get_text**: Get text content of an element
  - Parameters: `pageId` (required), `selector` (required)
  - Returns: Text content or "(no text found)"

- **screenshot**: Take a screenshot of the page
  - Parameters: `pageId` (required), `filename` (optional)
  - Returns: Path to saved screenshot

## Example Usage

Once configured with Claude, you can ask Claude to:

1. "Launch a chromium browser and navigate to https://example.com"
2. "Take a screenshot of the current page"
3. "Fill the search box with 'hello world' and click the search button"
4. "Get the text from the page title"
5. "Close the browser"

## Running Tests

To run your Playwright tests normally:

```bash
npm test
```

To run tests in headed mode (visible browser):

```bash
npm run test:headed
```

To view the test report:

```bash
npm run test:report
```

## Project Structure

- `mcp-server.js` - The MCP server implementation that exposes Playwright tools
- `mcp-config.json` - Configuration template for MCP server setup
- `MCP_SETUP.md` - This documentation file
- `tests/` - Your Playwright test files
- `playwright.config.ts` - Playwright configuration

## Troubleshooting

### Server won't start
- Ensure Node.js is installed and in your PATH
- Check that all npm packages are installed: `npm install`
- Try running with `node mcp-server.js` directly to see detailed error messages

### Server starts but tools aren't available
- Verify the configuration file points to the correct `mcp-server.js` path
- Restart your Claude Desktop application after updating the configuration
- Check Claude Desktop logs for connection errors

### Browser operations fail
- Ensure browsers are downloaded: `npx playwright install`
- Check that the browser and page IDs are correct
- Verify selectors match the actual page content
