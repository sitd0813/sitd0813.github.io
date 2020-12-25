// Copyright © 2021 SitD <sitd0813@gmail.com>
//
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {

}

// Called when the wasm module is instantiated
#[wasm_bindgen]
pub fn root_main() -> Result<(), JsValue> {
	// Use `web_sys`'s global `window` function to get a handle on the global
	// window object.
	let window = web_sys::window().expect("no global `window` exists");
	let document = window.document().expect("should have a document on window");
	let body = document.body().expect("document should have a body");

	// Manufacture the element we're gonna append
	let val = document.create_element("p")?;
	val.set_inner_html("Hello from Rust!");

	body.append_child(&val)?;

	Ok(())
}

#[wasm_bindgen]
pub fn root_post_main() -> Result<(), JsValue> {
	Ok(())
}

#[wasm_bindgen]
pub fn add(a: u32, b: u32) -> u32 {
	a + b
}