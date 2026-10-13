# DURETTI FAQ Concierge

The website concierge uses fixed question-and-answer buttons implemented in `../script.js`. Answers are displayed locally in the browser; the feature does not call an AI provider or submit visitor messages to a server.

Quotation and technical-specification actions open email drafts for the visitor to review and send. The website does not submit or store those inquiries.

The paid `/api/concierge` provider endpoint has been removed. `OPENAI_API_KEY` and `OPENAI_MODEL` are no longer required for the website's FAQ feature.
