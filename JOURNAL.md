# Journal for Agentic AI Training Course

## Journal Entry 1: Create Prompt for Config API Service

- Prompt: Read @/prompts/1-web-api-specs.md and follow the instructions at the top of the file.
- Tool: Antigravity
- Mode: Plan
- Context: Clean
- Model: Gemini 3 Pro (High)
- Input: prompts/1-web-api-specs.md
- Output: prompts/2-web-api-prompt.md
- Cost: Minimal
- Reflections: Created a prompt for the Config API Service based on the specifications in @/prompts/1-web-api-specs.md. The prompt is majorly a translation of the specifications into a prompt that can be used to create an implementation plan for the service. Strict adherence to the specifications is emphasized in the prompt.

## Journal Entry 2: Create Plan for Config API Service

- Prompt: Read @/prompts/2-web-api-prompt.md and follow the instructions at the top of the file.
- Mode: Plan
- Context: Clean
- Input: prompts/2-web-api-specs.md
- Output: prompts/3-web-api-plan.md
- Cost: Moderate
- Reflections: Created a plan for the Config API Service based on the prompt in @/prompts/2-web-api-prompt.md. The prompt contains a detailed phased implementation steps. The proposed project structure is not ideal

## Journal Entry 3: Create Config API Service

- Prompt: Please create a Config API Service in the `config-service` folder, according to the Implementation Plan defined in @/prompts/3-web-api-plan.md
- Mode: Planning
- Context: Clean
- Model: Gemini 3 Flash
- Input: prompts/3-web-api-plan.md
- Output: config-service/
- Cost: High
- Reflections: Ran into issues with installing and finding uv for package installation. Also initially ran into unit test failures which the agent resolved. There was a significant number of reviews required for suggested changes while the agent attempting to resolve these issues. 