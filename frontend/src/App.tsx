import { useState, useEffect } from 'react'
import { Upload, Download, Key, Lock, Unlock, Share2, AlertCircle } from 'lucide-react'

const BASE_URL = "http://localhost:8080"

function App() {
	const [data, setData] = useState('');
	const [shareableUrl, setShareableUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState('');
	const [decryptedData, setDecryptedData] = useState('');
	const [urlToLoad, setUrlToLoad] = useState('');

	/**
	 * @example
	 *	window.crypt -> generate random val i.e token, nonces 
	 *	hash password
	 *	enc/decr info
	 *	sign/verify mssgs
	 *	generateKey() -> Random key to encrypt the data.
	 *
	 **/
	const generateKey = async () => {
		return await window.crypto.subtle.generateKey(
			{ name: "AES-GCM", length: 128 },
			true,
			["encrypt", "decrypt"]
		);
	}

	// encrypt the content with that generated random key
	const encryptData = async (content: string, key: CryptoKey) => {
		// TextEncoder: convert the string into binary form (bytes)
		const encoder = new TextEncoder()
		const iv = new Uint8Array(12)

		return await window.crypto.subtle.encrypt(
			// AES-GCM, requires an iv to add randomness to each encryption. so Initialization Vector(iv) -> make the encryption result unpredictable
			{ name: "AES-GCM", iv: iv },
			key,
			encoder.encode(JSON.stringify(content))
		)
	}

	const uploadData = async () => {
		if (!data.trim()) {
			setStatus("Please share some data to encrypt and share!")
			return
		}

		setLoading(true)
		setStatus("Encrypting and uploading")

		try {
			const id = await generateKey()

			const encryptedData = await encryptData(data, id)

			console.log("encrypted data: ", encryptedData)

			const response = await fetch(`${BASE_URL}/upload`, {
				method: "POST",
				headers: {
					"Content-Type": "application/octet-stream"
				},
				body: encryptedData
			})

			if (!response.ok) {
				throw new Error("Upload Failed!")
			}

			const res = await response.json()

			console.log("response res: ", res)
			setLoading(false)
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message)
			}
		} finally {
			setLoading(false)
		}
	}

	const loadSharedData = () => {

	}

	const loadFromUrl = () => {

	}


	return (
		<div>
			<div className="max-w-4xl mx-auto p-6 bg-white">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						🔐 End-to-End Encryption Demo
					</h1>
					<p className="text-gray-600 max-w-2xl mx-auto">
						This demo shows how to implement client-side encryption like Excalidraw.
						Your data is encrypted before leaving your browser, and the server never sees your encryption key.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Upload Section */}
					<div className="bg-blue-50 rounded-lg p-6">
						<h2 className="text-xl font-semibold mb-4 flex items-center">
							<Lock className="mr-2" /> Encrypt & Share
						</h2>

						<textarea
							value={data}
							onChange={(e) => setData(e.target.value)}
							placeholder="Enter your secret data here..."
							className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>

						<button
							onClick={uploadData}
							disabled={loading || !data.trim()}
							className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						>
							{loading ? (
								'Processing...'
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Encrypt & Upload
								</>
							)}
						</button>

						{shareableUrl && (
							<div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
								<p className="font-semibold text-green-800 mb-2 flex items-center">
									<Share2 className="mr-2 h-4 w-4" />
									Shareable URL:
								</p>
								<input
									value={shareableUrl}
									readOnly
									className="w-full p-2 text-sm bg-white border rounded"
								/>
								<button
									onClick={() => navigator.clipboard.writeText(shareableUrl)}
									className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
								>
									Copy URL
								</button>
							</div>
						)}
					</div>

					{/* Download Section */}
					<div className="bg-green-50 rounded-lg p-6">
						<h2 className="text-xl font-semibold mb-4 flex items-center">
							<Unlock className="mr-2" /> Decrypt & View
						</h2>

						<input
							value={urlToLoad}
							onChange={(e) => setUrlToLoad(e.target.value)}
							placeholder="Paste the shareable URL here..."
							className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
						/>

						<button
							onClick={loadFromUrl}
							disabled={loading || !urlToLoad.trim()}
							className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
						>
							{loading ? (
								'Processing...'
							) : (
								<>
									<Download className="mr-2 h-4 w-4" />
									Download & Decrypt
								</>
							)}
						</button>

						{decryptedData && (
							<div className="mt-4 p-3 bg-white border border-green-300 rounded-lg">
								<p className="font-semibold text-green-800 mb-2">Decrypted Data:</p>
								<div className="bg-gray-100 p-3 rounded text-sm">
									{JSON.stringify(decryptedData, null, 2)}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Status */}
				{status && (
					<div className="mt-6 p-4 bg-gray-100 rounded-lg">
						<p className="text-center text-gray-700">{status}</p>
					</div>
				)}

				{/* How it works */}
				<div className="mt-8 bg-yellow-50 rounded-lg p-6">
					<h3 className="text-lg font-semibold mb-3 flex items-center">
						<Key className="mr-2" /> How it works:
					</h3>
					<div className="text-sm text-gray-700 space-y-2">
						<p>• <strong>Client-side encryption:</strong> Data is encrypted in your browser before upload</p>
						<p>• <strong>Key in URL hash:</strong> Encryption key is stored after the # symbol (never sent to server)</p>
						<p>• <strong>Server is blind:</strong> Server only stores encrypted blobs, cannot decrypt them</p>
						<p>• <strong>Secure sharing:</strong> Only people with the full URL can decrypt the data</p>
					</div>
				</div>

				<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
					<div className="flex items-start">
						<AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
						<div className="text-sm text-red-700">
							<strong>Important:</strong> This is a demo. In production, use proper IV generation,
							key derivation, and consider additional security measures like key rotation.
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
