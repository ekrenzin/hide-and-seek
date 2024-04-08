import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Ensure Firebase Admin SDK is initialized
const app = admin.initializeApp();
const db = app.firestore();

// Function to generate a unique lobby code
function generateLobbyCode(length = 6): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

interface CreateLobbyResponse {
	lobbyCode: string;
}

// Define the `createLobby` function
export const createLobby = onCall<CreateLobbyResponse>(async (data, context) => {
	const lobbyCode = generateLobbyCode();

	// Store the lobby code in Firestore
	await db.collection('lobbies').doc(lobbyCode).set({
		createdAt: admin.firestore.FieldValue.serverTimestamp()
	});

	// Return the lobby code to the caller
	return { lobbyCode };
});
