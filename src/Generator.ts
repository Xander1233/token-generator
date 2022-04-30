import { Tracert } from './lib/Tracert';
import crypto from 'crypto';
import { once } from 'events';

export class Generator {

	private static async calcHops(ip: string) {

		let hops = 0;

		const tracert = new Tracert();

		let destination = ip;

		try {
			tracert.on('hop', (hop) => {
				if (hop.ip !== '*') {
					hops++;
					destination = hop.ip;
				}
			});

			tracert.trace(ip);
		
			await once(tracert, 'close');
		} catch (err) {
			console.error(err);
			throw err;
		}

		return { ip: destination, hops };
	}

	private static generate(content: string): string {

		const hash = crypto.createHash('sha256');
		hash.update(content);
		const hashString = hash.digest('hex');

		return hashString;
	}

	public static async getToken(ip: string) {
		const { ip: destination, hops } = await this.calcHops(ip);
		const token = this.generate(this.calcTokenInput(destination, hops));
		return token;
	}

	private static calcTokenInput(destination: string, hops: number) {
		let res = 0;

		const chars = [ ...`${destination}${hops}` ];

		for (let i = 0; i < chars.length; i++) {
			res += chars[i].charCodeAt(0);
		}

		return `${destination}${hops}${res}`;
	}

}