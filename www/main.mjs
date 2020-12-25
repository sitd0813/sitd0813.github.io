//

//!

import wasm_init from "/static/wasm/wasm.js"

const main = async () => {
	const wasm = await wasm_init();

	console.log("Hello, World!");
	console.log(wasm.add(5, 6));
};

main();