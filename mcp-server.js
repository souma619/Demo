import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { chromium, firefox, webkit } from "playwright";

const server = new Server(
  {
    name: "playwright-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Track browser instances
const browsers = {};
const pages = {};
let browserCounter = 0;
let pageCounter = 0;

// Define tools
const tools = [
  {
    name: "launch_browser",
    description:
      "Launch a browser instance (chromium, firefox, or webkit)",
    inputSchema: {
      type: "object",
      properties: {
        browserType: {
          type: "string",
          enum: ["chromium", "firefox", "webkit"],
          description: "The type of browser to launch",
        },
        headless: {
          type: "boolean",
          description: "Whether to run in headless mode (default: true)",
        },
      },
      required: ["browserType"],
    },
  },
  {
    name: "new_page",
    description: "Open a new page in the browser",
    inputSchema: {
      type: "object",
      properties: {
        browserId: {
          type: "string",
          description: "The ID of the browser",
        },
      },
      required: ["browserId"],
    },
  },
  {
    name: "navigate_to",
    description: "Navigate to a URL in a page",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page",
        },
        url: {
          type: "string",
          description: "The URL to navigate to",
        },
      },
      required: ["pageId", "url"],
    },
  },
  {
    name: "click",
    description: "Click on an element",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page",
        },
        selector: {
          type: "string",
          description: "CSS selector of the element to click",
        },
      },
      required: ["pageId", "selector"],
    },
  },
  {
    name: "fill",
    description: "Fill input field with text",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page",
        },
        selector: {
          type: "string",
          description: "CSS selector of the input element",
        },
        text: {
          type: "string",
          description: "Text to fill in",
        },
      },
      required: ["pageId", "selector", "text"],
    },
  },
  {
    name: "get_text",
    description: "Get text content of an element",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page",
        },
        selector: {
          type: "string",
          description: "CSS selector of the element",
        },
      },
      required: ["pageId", "selector"],
    },
  },
  {
    name: "screenshot",
    description: "Take a screenshot of the page",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page",
        },
        filename: {
          type: "string",
          description: "Optional filename to save screenshot",
        },
      },
      required: ["pageId"],
    },
  },
  {
    name: "close_page",
    description: "Close a page",
    inputSchema: {
      type: "object",
      properties: {
        pageId: {
          type: "string",
          description: "The ID of the page",
        },
      },
      required: ["pageId"],
    },
  },
  {
    name: "close_browser",
    description: "Close a browser instance",
    inputSchema: {
      type: "object",
      properties: {
        browserId: {
          type: "string",
          description: "The ID of the browser",
        },
      },
      required: ["browserId"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "launch_browser": {
        const browserType = args.browserType;
        const headless = args.headless !== false;

        let browser;
        if (browserType === "chromium") {
          browser = await chromium.launch({ headless });
        } else if (browserType === "firefox") {
          browser = await firefox.launch({ headless });
        } else if (browserType === "webkit") {
          browser = await webkit.launch({ headless });
        } else {
          throw new Error(`Unknown browser type: ${browserType}`);
        }

        const browserId = `browser_${browserCounter++}`;
        browsers[browserId] = browser;

        return {
          content: [
            {
              type: "text",
              text: `Browser launched successfully. Browser ID: ${browserId}`,
            },
          ],
        };
      }

      case "new_page": {
        const browserId = args.browserId;
        const browser = browsers[browserId];

        if (!browser) {
          throw new Error(`Browser not found: ${browserId}`);
        }

        const page = await browser.newPage();
        const pageId = `page_${pageCounter++}`;
        pages[pageId] = page;

        return {
          content: [
            {
              type: "text",
              text: `Page created successfully. Page ID: ${pageId}`,
            },
          ],
        };
      }

      case "navigate_to": {
        const pageId = args.pageId;
        const url = args.url;
        const page = pages[pageId];

        if (!page) {
          throw new Error(`Page not found: ${pageId}`);
        }

        await page.goto(url);

        return {
          content: [
            {
              type: "text",
              text: `Navigated to ${url}`,
            },
          ],
        };
      }

      case "click": {
        const pageId = args.pageId;
        const selector = args.selector;
        const page = pages[pageId];

        if (!page) {
          throw new Error(`Page not found: ${pageId}`);
        }

        await page.click(selector);

        return {
          content: [
            {
              type: "text",
              text: `Clicked element: ${selector}`,
            },
          ],
        };
      }

      case "fill": {
        const pageId = args.pageId;
        const selector = args.selector;
        const text = args.text;
        const page = pages[pageId];

        if (!page) {
          throw new Error(`Page not found: ${pageId}`);
        }

        await page.fill(selector, text);

        return {
          content: [
            {
              type: "text",
              text: `Filled input field: ${selector}`,
            },
          ],
        };
      }

      case "get_text": {
        const pageId = args.pageId;
        const selector = args.selector;
        const page = pages[pageId];

        if (!page) {
          throw new Error(`Page not found: ${pageId}`);
        }

        const text = await page.textContent(selector);

        return {
          content: [
            {
              type: "text",
              text: text || "(no text found)",
            },
          ],
        };
      }

      case "screenshot": {
        const pageId = args.pageId;
        const filename = args.filename;
        const page = pages[pageId];

        if (!page) {
          throw new Error(`Page not found: ${pageId}`);
        }

        const screenshotPath = filename || `screenshot_${pageId}.png`;
        await page.screenshot({ path: screenshotPath });

        return {
          content: [
            {
              type: "text",
              text: `Screenshot saved to ${screenshotPath}`,
            },
          ],
        };
      }

      case "close_page": {
        const pageId = args.pageId;
        const page = pages[pageId];

        if (!page) {
          throw new Error(`Page not found: ${pageId}`);
        }

        await page.close();
        delete pages[pageId];

        return {
          content: [
            {
              type: "text",
              text: `Page closed: ${pageId}`,
            },
          ],
        };
      }

      case "close_browser": {
        const browserId = args.browserId;
        const browser = browsers[browserId];

        if (!browser) {
          throw new Error(`Browser not found: ${browserId}`);
        }

        await browser.close();
        delete browsers[browserId];

        return {
          content: [
            {
              type: "text",
              text: `Browser closed: ${browserId}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Playwright MCP server running on stdio");
}

main().catch(console.error);
