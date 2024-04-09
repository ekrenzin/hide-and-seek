import { writable, readable, derived } from 'svelte/store';
import { db, user } from '$lib/utils/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';

const LobbyCode = writable('');

//set the lobby code from local storage
const storedLobbyCode = localStorage.getItem('lobbyCode');
if (storedLobbyCode) LobbyCode.set(storedLobbyCode);

LobbyCode.subscribe(($LobbyCode) => {
	if (!$LobbyCode) return;

	// Save the lobby code to local storage
	localStorage.setItem('lobbyCode', $LobbyCode);
});

const LobbyUsers = readable([], (set) => {
	let unsubscribe = () => {};

	const unsub = LobbyCode.subscribe(($LobbyCode) => {
		console.log('LobbyCode changed:', $LobbyCode);
		// Unsubscribe from any previously set listener when the LobbyCode changes
		unsubscribe();

		if (!$LobbyCode) {
			set([]);
			return;
		}

		const colRef = collection(db, 'lobbies', $LobbyCode, 'users');

		// Set up a real-time listener for the users collection
		unsubscribe = onSnapshot(
			colRef,
			(snapshot) => {
				const users = snapshot.docs.map((doc) => doc.data());
				set(users);
			},
			(error) => {
				console.error('Failed to listen for lobby users changes:', error);
				set([]);
			}
		);
	});

	// Return an unsubscribe function that gets called when the store is no longer in use
	return () => {
		unsub();
		unsubscribe();
	};
});

const CurrentLobbyUser = derived([LobbyUsers, user], ([$LobbyUsers, $user]) => {
	if (!$user) return null;

	return $LobbyUsers.find((u) => u.uid === $user.uid);
});

export { LobbyCode, LobbyUsers, CurrentLobbyUser };
