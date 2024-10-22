/*
How to run:

1. Ensure backend is running
2. cd into backend/matching-service/tests
3. npx ts-node testClient.ts Name difficulty category category
e.g. npx ts-node testClient.ts Alice medium algo recursion

do this in 2 different terminals e.g. 
npx ts-node testClient.ts urmum medium algo recursion 

and in another terminal
npx ts-node testClient.ts urdad medium algo recursion

urmum should match with urdad
*/
import { io } from 'socket.io-client';

interface MatchRequest {
  name: string;
  difficulty: string;
  categories: string[];
}

const userName = process.argv[2];
const difficulty = process.argv[3];
const categories = process.argv.slice(4);

if (!userName || !difficulty || categories.length === 0) {
  console.error('Usage: ts-node testClient.ts <name> <difficulty> <category1> <category2> ...');
  process.exit(1);
}

const socket = io('http://localhost:5002');

socket.on('connect', () => {
  console.log(`Connected as ${userName} with socket ID: ${socket.id}`);
  socket.emit('login', userName);

  socket.emit('requestMatch', {
    name: userName,
    difficulty: difficulty,
    category: categories,
  });
  console.log(`Sent match request for ${userName}`);
});

socket.on('matchFound', (partner: any) => {
  console.log(`Match found for ${userName}:`, partner);
});

socket.on('noMatchFound', (data: any) => {
  console.log(`No match found for ${userName}:`, data.message);
});

socket.on('disconnect', () => {
  console.log(`${userName} disconnected`);
});
