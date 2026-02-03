# Module 1 Practice

> Part 1: The Service

## Overview

1. Getting setup
2. Create the specification
3. Create a prompt
4. Create a plan
5. Implement the plan
6. Rinse & repeat
7. Collaborative code improvements
8. An example

## Step by Step

### 1. Create a working folder structure and initialise Git

```sh
mkdir -p ~/projects/ai-course/module1/{prompts,config-service}
cd ~/projects/ai-course/module1
touch JOURNAL.md
git init .
```

We will use `JOURNAL.md` to capture the details of our collaborations - an account of how we built the resulting assets. You can also use this as a learning journal.

### 2. Create a file that contains the initial specifications for your configuration service

   > Because our prompt files will be applied in order, numerical prefixes can be helpful.
   
**`prompts/1-web-api-specs.md`** should contain at least:
- Programming language choice
- Web framework and supporting dependencies
- API endpoints and payloads details
- Database engine & driver library
- Storage & query-related preferences

You revise this file over a number of iterations. You'll assess the results you get with a few details and how they change as you add more detail. Start with whatever level of detail you're comfortable with. The results will inspire the changes you make.

### 3. Collaborate with our assistant to create a prompt

a. First, let's create the first journal entry, which will be to collaborate with our assistant, to create a prompt, that will create a plan that we can implement to scaffold our Config API Service (whew, that was a lot).

Here's the start of our first journal entry:
- Prompt (what we're asking of our assistant): Read @/prompts/1-web-api-specs.md and follow the instructions at the top of the file.
- Tool (our AI assistant): Cline
- Mode (plan, act, etc.): Plan
- Context (clean, from previous, etc.): Clean
- Model (LLM model and version): Claude 3.7 Sonnet
- Input (file added to the prompt): prompts/1-web-api-specs.md
- Output (file that contains the response): prompts/2-web-api-prompt.md
- Cost (total cost of the full run): [enter after the run completes]
- Reflections (narrative assessments of the response): [enter after the run completes]

b. Next, let's include our _prompt creation_ instructions. At the top of your `prompts/1-web-api-specs.md`, include instructions for using the contents of this file to create a prompt. Here is an example, but try a number of different variations and models to see what the include and omit:

> This document contains details necessary to create a prompt, which will later be used to create an implementation plan for a REST Web API. Please review the contents of this file and recommend a PROMPT that can be sent to an AI coding assistant for help with creating an implementation plan for this service. 
> 
> The prompt should:
> - ask the assistant to create a comprehensive plan that includes dependencies, file/folder structure, and architectural patterns.
> - recommend strict adherence to ALL of the details in this document.
> - strongly encourage the assistant to not add any additional dependencies without approval.
> - encourage the assistant to ask for more information if they need it.

c. Finally, issue the prompt from our journal entry (where we ask it to follow the instructions at the top of the file) to our assistant in our coding environment. Be sure your spec file is saved, you're in plan mode and have the correct model selected. You can either have your assistant write the prompt to `prompts/2-web-api-prompt.md` (you'll need to switch to act mode) or you can just copy/paste it and save the tokens.

d. Review the prompt, and add the cost and any reflections about the prompt your assistant created into the journal entry.

e. Save, stage, and commit all of your changes before moving on to the next step. If you would like to redo this step or iterate on it before moving on, that's cool, just commit FIRST.

### 4. Collaborate with our assistant to create a plan

a. Start with a new journal entry:
- Prompt: Read @/prompts/2-web-api-prompt.md and follow the instructions at the top of the file.
- Mode: Plan
- Context: Clean
- Input: prompts/2-web-api-specs.md
- Output: prompts/3-web-api-plan.md

b. Issue the prompt to your assistant and save the results into `prompts/3-web-api-plan.md`.

c. Review the plan, and record the cost and your reflections in the journal entry.

d. Save, stage, and commit all of your changes before moving on to the next step. If you would like to redo this step or iterate on it before moving on, that's cool, just commit FIRST.

## 5. Execute the implementation plan

a. You know the drill ... start with a journal entry:
- Prompt:  Please create a Config API Service in the `config-service` folder, according to the Implementation Plan defined in @/prompts/3-create-web-api-plan.md
- Mode: Act
- Context: Clean
- Model: Claude Sonnet 4
- Input: prompts/3-web-api-plan.md
- Output: config-service/

b. Issue the prompt to your assistant. Make sure you are in a mode that lets them use filesystem tools (e.g. act) with _read_ and _edit_ access. While your assistant is scaffolding the project, monitor their progress. If they begin doing anything unexpected, you can stop them (ESC in Cline).

c. Review the scaffolded project. As you notice things, add them as reflections in the journal entry. There is an assumption you have noticed things you would like to be different if/when you run this implementation plan again.

d. For code-related improvements, capture them as _rules_. Create a Markdown file in the `.clinerules` folder (e.g. `.clinerules/coding.md`). You can also do this in the Rules section of the Cline UI.

e. Save, stage, and commit all of your changes before moving on to the next step. If you would like to redo this step or iterate on it before moving on, that's cool, just commit FIRST. Be sure your `.gitignore` is in place and properly configured.

### 6. Rinse & Repeat

a. You can iterate from any of the earlier steps. You don't need to start all over with the specs. You can edit the prompt or the plan and generate assets in the subsequent steps.

If you would like to try a different set of specs, check out `module1/practice/examples/1-web-api-specs.md`.

b. Be sure to commit your experiments. It can be helpful to compare previous experiments. And with all of your experiments captured, you can have your assistant compare differences.

c. Once you're happy enough with the scaffolded project, you can transition to collaborating on the code directly.

### 7. Collaborative Code Improvements

a. You've decided your current scaffolded project is sufficient to iterate on. If the unit tests aren't already passing, this is a good place to start.

b. Identify the first improvement you would like to make. Try to avoid making the code changes directly. Use this time to practice collaborating with your assistant. Remember your assistant can assume a number of roles: brainstormer, mentor, QA expert, etc.

c. Don't forget to use your journal and commit frequently.
### 8. An Example

Before moving on to part 2, you should have a working Configuration API service that a client can successfully consume. If yours is in that state, wonderful! If you would like to use one that has been prepared ahead of time, please see `/01-Foundations/examples/config-service/svc` for a Python one.
