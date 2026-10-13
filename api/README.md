# DURETTI Inquiry Email

The Contact form and concierge quotation form submit to `/api/inquiry`, which sends each inquiry to `dan.daman@duretti-yachts.com` through Resend. The website does not store submitted inquiries. Resend processes the email as the delivery provider.

Vercel environment variables

`RESEND_API_KEY` is the secret API key from the Resend account. `RESEND_FROM_EMAIL` is a sender address accepted by Resend, such as `DURETTI Website <website@your-verified-domain.com>`. The sender domain must be verified in Resend. Configure both variables for Production (and Preview when testing there).

Redeploy the project after adding or changing environment variables. The forms display an error if email is not configured or sending fails; they do not silently switch to opening an email draft. The recipient is fixed in `inquiry.js`.

The concierge FAQ answers remain static and local. They do not call an AI provider. `OPENAI_API_KEY` and `OPENAI_MODEL` are not used by this website.
