/*
 * END-TO-END ENCRYPTION FLOW
 * ==========================
 * 
 * SHARING DATA:
 * content -> encrypt -> send to server -> get shareable URL
 * 
 * RECEIVING DATA:  
 * shareable URL -> download from server -> decrypt -> view content
 * 
 * KEY POINT:
 * Server stores encrypted data but NEVER sees the decryption key
 * important: Key travels in URL after # symbol (browsers don't send this to server)
 */

import express, { type Request, type Response, type Express } from 'express'
import crypto from 'crypto'
import cors from 'cors'
import 'dotenv/config'

const app: Express = express();
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }))
app.use(express.json())
app.use(cors({
	origin: "http://localhost:5173"
}))
const PORT = process.env.PORT ?? 3000

const storage = new Map()

app.post('/upload', (req: Request, res: Response) => {
	try {
		const id = crypto.randomBytes(16).toString("hex")
		storage.set(id, req.body)

		console.log(storage)
		res.json({
			success: true,
			id,
			url: `http://localhost:3001/scene/${id}`
		})
	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message)
		}
	}
})

app.get('/download/:id', (req: Request, res: Response) => {
	try {
		const { id } = req.params
		console.log("id backend: ", id)
		const encryptedData = storage.get(id)

		if (!encryptedData) {
			res.status(404).json({ error: "Data not found!" })
			return;
		}

		res.setHeader('Content-Type', "application/octet-stream")
		res.send(encryptedData)

	} catch (err) {
		if (err instanceof Error) {
			console.log(err.message)
			res.status(500).json({ error: "Download Failed!" })
		}
	}
})

app.listen(PORT, () => {
	console.log(`Server is listening at   ${PORT}`)
})
