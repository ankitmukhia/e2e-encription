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
 * Key travels in URL after # symbol (browsers don't send this to server)
 */

 [Source](https://plus.excalidraw.com/blog/end-to-end-encryption)
