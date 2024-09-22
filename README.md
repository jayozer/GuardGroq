# GuardGroq: 
### LLaMA Guard-Powered Content Shield
Your configurable, speedy shield for user messages! It keeps conversations safe and on-topic using the latest LLaMA Guard and Groq's super-fast tech. Designed for Voiceflow's new knowledge base template. Easy to use!


# LLM Moderation Guardrail for Voiceflow

<img src="images/GuardGroq (1861 x 625 px).png" alt="GuardGroq: LLaMA Guard-Powered Content Shield Logo" width="930" height="310"/>


## How It Works

GuardGroq moderates content using LLaMA Guard 3 and Groq's LPU technology, following these steps:
1. User Input: Receives the user's utterance as input.
2. Rapid Classification: Uses LLaMA Guard 3 to classify the input as safe or unsafe.
3. Safe Content Handling: If safe, passes the original utterance as output.
4. Unsafe Content Management: If unsafe, categorizes the content according to MLCommons hazards taxonomy.
5. Response Generation: Provides a safeguard configurable response based on the identified category.
6. Custom Heuristics: Applies additional content-based checks using a sensitive keywords list.

## Features

- Easy integration with Voiceflow's knowledge base response template
- Utilizes latest LLaMA Guard 3 8B model
- Leverages Groq's high-speed LPU technology for near-instantaneous input moderation
- Built-in content-based heuristics system for enhanced moderation
- Customizable topic-related responses responses for MLCommons standardized hazards taxonomy
- Configurable for various domains and use cases


Inputs:
- `groqApiKey`
- `last_utterance`

Outputs:
- `answer`
- `error`

Paths:
- `success`
- `error`




