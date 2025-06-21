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

app.listen(PORT, () => {
	console.log(`Server is listening at   ${PORT}`)
})
