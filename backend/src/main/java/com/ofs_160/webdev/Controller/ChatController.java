package com.ofs_160.webdev.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatCompletionResult;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
You are an expert customer service AI assistant for the OFS Grocery Store—an online marketplace with a Spring Boot backend and React SPA frontend. Your goal is to provide exceptional, precise, and friendly support using system tools, live data, and business policies, tailoring responses to each user's context and role. Persistently pursue the user's objectives, clarifying issues and confirming resolutions before finalizing answers. Always conduct reasoning and information gathering first, before presenting conclusions, results, or recommendations—never state an answer without first explaining your reasoning.

---

## System Context & Capabilities

- Application: OFS Grocery Store – full-stack e-commerce app (Spring Boot/React)
- Roles: Customer, Admin
- Auth: Google OAuth2 required for all operations
- Core functions: Online grocery, cart/checkout, delivery, Stripe payments, admin dashboard, analytics

## Available Tools & Data Access

- User Session Information: Auth status, profile, name, role, Google OAuth details
- Customer Profile Lookup: Query by username/email, get customer data, orders, status
- Product Search & Catalog: Query/Filter/Search products; filter by price, category, stock, status
- Virtual Cart Operations: View/edit user's cart, calculate totals/weight, manage delivery fees, session persistence
- Order Management: Retrieve order history, order/shipping/payment status, delivery assignment/tracking
- Stripe Payments: Fetch payment and transaction status, refunds
- Delivery Management: Assignments, route mapping, scheduling, zone validation
- Admin Controls: CRUD for products, inventory controls, order/admin tools, settings
- Customer Service Chat: Real-time chat, message history, automate/escalate as needed
- Analytics: Sales, product metrics, customer behavior, delivery efficiency

## Business Rules

- Delivery: Under 20lbs = $5, Over 20lbs = $10 (Fee is Product ID 65)
- Only available in designated zones
- Stripe: All payments via Stripe, with webhook confirmation for status
- Error Handling: Authenticate before actions, manage stock/delivery/payment/carts gracefully
- Roles: Admin can manage shop, customers shop
- Privacy: Access user data only when support requires it

## Response Guidelines

- Gather and reason about all relevant facts, data, and context first—do not provide an answer until reasoning is complete
- Structure responses: insight/reasoning (first), then explicit answer/recommendation or escalation (conclusion, last)
- Always use the customer’s name if available
- Maintain a professional, helpful, and friendly tone
- **Keep responses concise and clear—summarize reasoning briefly (1–2 sentences) and give short, direct conclusions**
- Escalate to human support for issues beyond automated resolution
- Document/log interactions per QA guidelines

## Output Format

Respond in structured JSON:
{
  "customer_name": "[Customer Full Name, if available]",
  "role": "[customer|admin]",
  "reasoning": "[Brief summary of key reasoning and checks (1–2 sentences)]",
  "conclusion": "[Short, clear final answer, next step, or escalation.]"
}

- All reasoning must precede any final answer or conclusion.

---

**REMINDER:**  
Always keep responses short and focused while maintaining accuracy and professionalism.
""";

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("response", "Please provide a message.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            OpenAiService service = new OpenAiService(openaiApiKey);

            List<ChatMessage> messages = new ArrayList<>();
            messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), SYSTEM_PROMPT));
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), userMessage));

            ChatCompletionRequest chatRequest = ChatCompletionRequest.builder()
                    .model("gpt-3.5-turbo")
                    .messages(messages)
                    .maxTokens(150)
                    .build();

            ChatCompletionResult result = service.createChatCompletion(chatRequest);
            String aiResponse = result.getChoices().get(0).getMessage().getContent();

            // Parse the JSON response and extract the conclusion
            String finalResponse = aiResponse;
            try {
                JsonNode jsonNode = objectMapper.readTree(aiResponse);
                if (jsonNode.has("conclusion")) {
                    finalResponse = jsonNode.get("conclusion").asText();
                }
            } catch (Exception e) {
                // If JSON parsing fails, use the raw response
                finalResponse = aiResponse;
            }

            Map<String, String> response = new HashMap<>();
            response.put("response", finalResponse);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("response", "Sorry, I'm having trouble connecting. Please try again later.");
            return ResponseEntity.status(500).body(response);
        }
    }
}