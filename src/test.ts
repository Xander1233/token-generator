import { Generator } from "./Generator";

(async function() {
	console.log(await Generator.getToken(process.argv[2]));
})()