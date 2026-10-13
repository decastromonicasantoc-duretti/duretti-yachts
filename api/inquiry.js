const recipient = 'dan.daman@duretti-yachts.com';
const newline = String.fromCharCode(10);

function sendJson(res, status, body) {
  	res.statusCode = status;
  	res.setHeader('Content-Type', 'application/json; charset=utf-8');
  	res.end(JSON.stringify(body));
}

function field(body, name, limit, required = false) {
  	const value = typeof body[name] === 'string' ? body[name].trim() : '';
  	if ((required && !value) || value.length > limit) return null;
  	return value;
}

function getInquiry(body) {
  	if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  	if (body.type !== 'contact' && body.type !== 'quotation') return null;
  	const contact = body.type === 'contact';
  	const fields = {
      		name: field(body, 'name', 100, true),
      		email: field(body, 'email', 254, true),
      		phone: field(body, 'phone', 40, contact),
      		interest: field(body, 'interest', 80, contact),
      		message: field(body, 'message', 3000, contact),
      		region: field(body, 'region', 100),
      		model: field(body, 'model', 100),
      		use: field(body, 'use', 200),
      		details: field(body, 'details', 1200)
    };
  	const emailParts = fields.email && fields.email.split('@');
  	if (!fields.name || !emailParts || emailParts.length !== 2 || !emailParts[0] || !emailParts[1].includes('.') || emailParts[1].startsWith('.') || emailParts[1].endsWith('.')) return null;
  	if (contact && (!fields.phone || !fields.interest || !fields.message)) return null;
  	return { type: body.type, fields };
}

export default async function handler(req, res) {
  	if (req.method !== 'POST') {
      		res.setHeader('Allow', 'POST');
      		return sendJson(res, 405, { error: 'Method not allowed.' });
    }
  	try {
      		if (new URL(req.headers.origin || '').host.toLowerCase() !== String(req.headers.host || '').toLowerCase()) {
            			return sendJson(res, 403, { error: 'Requests must come from this website.' });
          }
    } catch {
      		return sendJson(res, 403, { error: 'Requests must come from this website.' });
    }
  	if (JSON.stringify(req.body || {}).length > 12000) return sendJson(res, 413, { error: 'The inquiry is too large.' });
  	const inquiry = getInquiry(req.body);
  	if (!inquiry) return sendJson(res, 400, { error: 'Please check your inquiry details and try again.' });

	const apiKey = process.env.RESEND_API_KEY;
  	const from = process.env.RESEND_FROM_EMAIL;
  	if (!apiKey || !from) {
      		console.error('Inquiry email service is missing RESEND_API_KEY or RESEND_FROM_EMAIL.');
      		return sendJson(res, 503, { error: 'Email service is not configured yet. Please email dan.daman@duretti-yachts.com directly.' });
    }

	const { type, fields } = inquiry;
  	const model = (fields.model || '').split(newline).join(' ').split(String.fromCharCode(13)).join(' ');
  	const subject = type === 'contact'
  		? `DURETTI website inquiry: ${fields.interest}`
      		: `DURETTI yacht inquiry${model ? `: ${model}` : ''}`;
  	const text = type === 'contact'
  		? ['New inquiry from the DURETTI Yachts website', '', `Name: ${fields.name}`, `Email: ${fields.email}`, `Phone: ${fields.phone}`, `Interest: ${fields.interest}`, '', 'Message:', fields.message].join(newline)
      		: ['New yacht inquiry from the DURETTI Yachts concierge', '', `Name: ${fields.name}`, `Email: ${fields.email}`, `Country or region: ${fields.region || 'Not provided'}`, `Preferred yacht model: ${fields.model || 'Not provided'}`, `Intended use: ${fields.use || 'Not provided'}`, '', 'Specifications or customization:', fields.details || 'Not provided'].join(newline);

	try {
    		const response = await fetch('https://api.resend.com/emails', {
          			method: 'POST',
          			headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          			body: JSON.stringify({ from, to: [recipient], reply_to: fields.email, subject, text })
        });
    		if (!response.ok) {
          			console.error(`Resend rejected an inquiry email with status ${response.status}.`);
          			return sendJson(res, 502, { error: 'We could not send your inquiry right now. Please email dan.daman@duretti-yachts.com directly.' });
        }
    		return sendJson(res, 200, { ok: true });
  } catch {
    		console.error('Unable to reach the email provider for an inquiry.');
    		return sendJson(res, 502, { error: 'We could not send your inquiry right now. Please email dan.daman@duretti-yachts.com directly.' });
  }
}
