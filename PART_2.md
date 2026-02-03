# Module 1 Practice

> Part 2: The Admin UI

## Overview

1. Create a prompt
2. Create a plan
3. Implement the plan
4. Rinse & repeat
5. Collaborative code improvements
6. An example

## Step by Step

This time we aren't starting from a blank page. We can use the endpoint definitions to scaffold an admin UI client.

### 1. Create a prompt

> Unlike when we created the API service, in this step we create the prompt by hand rather than through a collaboration with our assistant. Feel free to use the earlier approach if you prefer.

a. Create a `ui/` folder as a sibling to `config-service`. This is where we will have our assistant put the code when we're ready.

b. Create `prompts/4-admin-ui-prompt.md` and include a prompt to create a plan using the endpoint definitions from the config service. You can either add the routing file to the context or provide the detail in the prompt itself. Include the frontend technology you would like to use with specific versions if you know them. Here is an example prompt:

> Create an implementation plan for an admin web interface that has features for adding and updating application entries as well as adding and updating the configuration name/value pairs.
>
> - Use `@config-service/svc/api/endpoints.py` to understand which endpoints and payloads are available.
> - Use pnpm to manage dependencies and run scripts.
> - All code should either be TypeScript, HTML, or CSS. Do not use JavaScript directly.
> - Do not take any external dependencies, such as React and Vue, and use the Web Components functionality built into the browser. Also, only use the `fetch` feature of  modern browsers. The same principle applies to styling - only CSS and the Shadow DOM. 
> - Automated testing is very important so ensure the plan includes unit testing with vitest and integration testing with Playwright.
>
> If you could have 3 more additional pieces of information in this prompt, what would be the most important to ensure a working result?

### 2. Create a plan

a. Let's start with a journal entry for creating the plan:
- Prompt: Read @/prompts/4-admin-ui-prompt.md and follow the instructions at the top of the file.
- Tool: Cline
- Mode: Plan
- Context: Clean
- Model: Claude 3.7 Sonnet
- Input: prompts/4-admin-ui-prompt.md
- Output: prompts/5-admin-ui-plan.md

b. Issue the request to your assistant and review their response. Add the cost and your reflections to the journal entry. Reflections:
- Did it include: class structure, file/folder names/locations, sufficient detail for test automation, a list of external dependencies with version numbers?
- What gaps did it fill in on its own? Was its decision close?
- Does everything that needs it, have sufficient emphasis?

c. Save, stage, and commit all of your changes before moving on to the next step. If you would like to redo this step or iterate on it before moving on, that's cool, just commit FIRST.

### 3. Implement the plan

a. New journal entry:
- Prompt: Read @/prompts/5-admin-ui-plan.md and follow the instructions at the top of the file.
- Tool: Cline
- Mode: Act
- Context: Clean
- Model: Claude Sonnet 4
- Input: prompts/5-admin-ui-plan.md
- Output: ui/

b. Issue the request to your assistant and review their response. Add the cost and your reflections to the journal entry. Reflections:
- What code changes would you like to see in the next run?
- Does it run without errors? Do the tests pass?
- What surprised you about the implementation?

c. For code-related improvements, capture them as _rules_. Create a Markdown file in the `.clinerules` folder (e.g. `.clinerules/coding.md`). You can also do this in the Rules section of the Cline UI.

d. Save, stage, and commit all of your changes before moving on to the next step. If you would like to redo this step or iterate on it before moving on, that's cool, just commit FIRST.

### 4. Rinse & repeat

a. You can iterate from the prompt or the plan and regenerate assets in the subsequent steps until you're happy enough to begin iterating on the code.

If you would like to try a different prepared-ahead-of-time prompt, check out `01-Foundations/practice/examples/4-admin-ui-prompt.md`.

b. Be sure to commit your experiments. It can be helpful to compare previous experiments. And with all of your experiments captured, you can have your assistant compare differences.

c. Once you're happy enough with the scaffolded Web UI project, you can transition to collaborating on the code directly on specific changes.

### 5. Collaborative code improvements

a. If the unit tests aren't already passing, this is a good place to start.

b. Identify the first improvement you would like to make. Try to avoid making the code changes directly. Use this time to practice collaborating with your assistant. Remember your assistant can assume a number of roles: brainstormer, mentor, QA expert, etc.

c. Don't forget to use your journal and commit frequently.

### 6. An example

If you would like to have a play with a Python/Web Components pair that are working together, check out `/01-Foundations/examples/config-service`.
