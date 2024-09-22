/**
 * Main function for content moderation using LLaMA Guard via Groq API
 * @param {Object} args - The input arguments
 * @param {Object} args.inputVars - The input variables
 * @param {string} args.inputVars.last_utterance - The user's last utterance to be moderated
 * @param {string} args.inputVars.groqApiKey - The API key for Groq
 * @returns {Object} - The result object containing outputVars, next path, and trace
 */
export default async function main(args) {
  const { inputVars } = args;
  let { last_utterance, groqApiKey } = inputVars;

  // Sanitize input
  last_utterance = last_utterance?.trim().toLowerCase();
  groqApiKey = groqApiKey?.trim();
  
  const maxTokens = 300;

  /* LLaMA Guard Hazard Categories Reference: 
  model card: https://huggingface.co/meta-llama/Llama-Guard-3-8B
      S1: Violent Crimes
      S2: Non-Violent Crimes
      S3: Sex-Related Crimes
      S4: Child Sexual Exploitation
      S5: Defamation
      S6: Specialized Advice
      S7: Privacy
      S8: Intellectual Property
      S9: Indiscriminate Weapons
      S10: Hate
      S11: Suicide & Self-Harm
      S12: Sexual Content
      S13: Elections
      S14: Code Interpreter Abuse
  */

  const s_code_responses = {
    "S1": "Let's keep things safe—no violent behavior here. But hey, brushing twice daily is always a good idea!",
    "S2": "Crimes of any kind are not cool! But we can talk about how to prevent cavities instead!",
    "S3": "No room for anything inappropriate here. How about we chat about fluoride instead?",
    "S4": "Not appropriate for kids—or anyone. Let's focus on keeping your smile bright!",
    "S5": "We don't spread rumors here, only helpful dental tips! Did you know brushing your tongue can improve breath?",
    "S6": "Leave the medical advice to your doctor. But I can tell you the best time to visit a pediatric dentist!",
    "S7": "Keeping secrets safe! We only share dental hygiene tips here, like using soft bristles!",
    "S8": "We play by the rules and respect all rights. Let's talk about the best toothpaste for kids instead!",
    "S9": "No dangerous stuff allowed. Let's keep things peaceful and talk about dental sealants!",
    "S10": "Kindness is key here! Let's celebrate all smiles with positive energy!",
    "S11": "You matter! If you're feeling down, talk to a grown-up. In the meantime, don't forget to floss!",
    "S12": "Inappropriate content is a no-go. But let's discuss when kids should start losing baby teeth!",
    "S13": "We keep it factual here, no election-related mistakes! Let's stick to brushing basics instead.",
    "S14": "Nice try! No hacking here, just tooth-friendly tips for a great dental routine!"
  };

  // Content-based heuristics
  const sensitiveKeywords = ['election', 'vote', 'presidential', 'trump', 'kamala', 'hack', 'exploit', 'political candidate'];
  if (sensitiveKeywords.some(keyword => last_utterance.includes(keyword))) {
    const pediatricDentalTopics = [
      "why baby teeth are important 🍼🦷",
      "fun ways to encourage kids to brush their teeth 🦷🎉",
      "choosing the right toothbrush for your child🪥",
      "the Tooth Fairy's favorite dental hygiene tips 🧚🦷",
      "how to make flossing fun for kids 🧵😁",
      "healthy snacks that are good for teeth 🥕",
      "what to expect during your child's first dental visit 🦷👶",
      "the magic of fluoride in fighting cavities ✨",
      "why sealants are like superhero capes for teeth 🦸🦷",
      "how to care for your child's smile after losing a tooth 😬🦷"
    ];
    const randomTopic = pediatricDentalTopics[Math.floor(Math.random() * pediatricDentalTopics.length)];

    return {
      outputVars: {
        answer: `Oops! Let's brush that topic aside and sink our teeth into ${randomTopic}?`
      },
      next: { path: 'success' },
      trace: [{ type: "text", payload: { message: "Sensitive keyword detected. Redirected to pediatric dental topic." } }],
    };
  }

  try {
    // Validate Groq API key
    if (!groqApiKey) {
      return {
        outputVars: {
          error: `Please provide your Groq API key`
        },
        next: {
          path: 'error'
        },
        trace: [
          {
            type: 'debug',
            payload: {
              message: `No Groq API key provided`
            }
          }
        ],
      };
    }

    // Validate last_utterance
    if (!last_utterance) {
      return {
        outputVars: {
          error: `No user question provided`
        },
        next: {
          path: 'error'
        },
        trace: [
          {
            type: 'debug',
            payload: {
              message: `No user question value`
            }
          }
        ],
      };
    }

    // Prepare API request to Groq
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-guard-3-8b",
        messages: [
          {
            role: "user",
            content: last_utterance,
          }
        ],
        temperature: 0,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false,
      })
    };

    // Make API request
    const response = await fetch(url, options);
    const result = await response.json;

    // Process API response
    if (response.ok && result?.choices?.[0]?.message?.content) {
      let answer = result.choices[0].message.content.trim().toLowerCase();

      // Handle safe content
      if (answer.startsWith("safe")) {
        // Content is safe, return the original last_utterance
        return {
          outputVars: {
            answer: last_utterance
          },
          next: {
            path: 'success'
          },
          trace: [
            {
              type: "text",
              payload: {
                message: "Safe content detected.",
              },
            },
          ],
        };
      } else {
        // Handle unsafe content
        const match = answer.match(/s(\d+)/);
        if (match) {
          const sCode = `S${match[1]}`;
          if (s_code_responses[sCode]) {
            return {
              outputVars: {
                answer: s_code_responses[sCode]
              },
              next: {
                path: 'success'
              },
              trace: [
                {
                  type: "text",
                  payload: {
                    message: `Unsafe content detected (${sCode}). Safe response provided.`,
                  },
                },
              ],
            };
          }
        }
        // Fallback for unspecified unsafe content
        return {
          outputVars: {
            answer: "I'm sorry, but I can't respond to that. Let's talk about something else!"
          },
          next: {
            path: 'success'
          },
          trace: [
            {
              type: "text",
              payload: {
                message: "Unsafe content detected. Generic safe response provided.",
              },
            },
          ],
        };
      }
    } else {
      return {
        outputVars: {
          error: `Unable to get an answer: ${result.error?.message || 'Unknown error'}`
        },
        next: {
          path: 'error'
        },
        trace: [
          {
            type: 'debug',
            payload: {
              message: `API response error: ${result.error?.message || 'Unknown error'}`
            }
          }
        ],
      };
    }
  } catch (error) {
    return {
      outputVars: {
        error: error.toString()
      },
      next: {
        path: 'error'
      },
      trace: [
        {
          type: 'debug',
          payload: {
            message: `this is an error: ${error}`
          }
        }
      ],
    };
  }

  // Input/Output documentation
  // Inputs: groqApiKey, last_utterance
  // Outputs: answer, error
  // Paths: success, error
}