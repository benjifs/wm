import Webmention from '../shared/lib/webmention'
const sendMention = require('../shared/lib/send')

const respond = (code, body) => (new Response(JSON.stringify(body), { status: code }))

export default async (req) => {
	if (!['GET', 'POST'].includes(req.method)) return respond(405, { error: 'method not allowed' })

	const params = new URL(req.url).searchParams
	const url = params.get('url')
	const limit = params.get('limit') || 10
	if (!url) return respond(400, { error: 'Missing "url"' })

	const checkWebmentions = (method) => new Promise((resolve, reject) => {
		const wm = new Webmention({ limit })
		wm.on('error', e => {
			reject({ error: e.message })
		})

		wm.on('endpoints', urls => {
			if ('POST' == method) {
				return Promise.all(urls.map(sendMention)).then(reply => {
					resolve({ urls: reply })
				})
			}

			if (urls.length === 0 && wm.mentions.length > 0) {
				reject({
					error: `No webmention endpoints found in the ${wm.mentions.length} content ${wm.mentions.length === 1 ? 'entry' : 'entries'}`,
				})
			} else {
				resolve({ urls })
			}
		})

		wm.fetch(url)
	})

	try {
		const res = await checkWebmentions(req.method)
		return respond(200, res)
	} catch (e) {
		return respond(400, e)
	}
}