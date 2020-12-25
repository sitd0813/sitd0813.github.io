//

//!

import marked from "/static/dep/marked=1.2.7/marked.esm.js";

import { Some, None, Ok, Err, match } from "/static/script/rust.mjs";

const fetch_text = async (input, init) => /* Promise<Result<string, Error>> */ {
	return fetch(input, init).then(async (response) => {
		if (response.ok) {
			return new Ok(await response.text());
		} else {
			return new Err(Error(response.statusText));
		}
	});
};

export class Page {
	title;
	date;
	html_content;

	constructor(markdown) {
		let text = marked(markdown);

		let dom_parser = new DOMParser();
		let html = dom_parser.parseFromString(text, "text/html").body;
		let h1 = html.querySelector("h1");
		this.title = html.querySelector("h1").innerHTML;

		h1.remove();
		this.html_content = html.innerHTML;
	}
}

class PostMetadata {
	id;
	name;
	page_count;

	constructor(id, name, page_count) {
		this.id = id;
		this.name = name;
		this.page_count = page_count;
	}
}

export class PostManager {
	post_metadatas;

	#root;

	constructor(root) {
		this.#root = root;
	}

	fetch_list = async () => {
		const text = await (await fetch_text(this.#root + "/list.json")).unwrap();

		const post_metadatas = [];
		for (const [id, metadata] of Object.entries(JSON.parse(text))) {
			const post_metadata = new PostMetadata(metadata.id, metadata.name, metadata.page_count);
			post_metadatas.push(post_metadata);
		}

		this.post_metadatas = post_metadatas;
	}

	get_page = async (post_id /* string */, page_number /* number */) /* Promise<Result<Page, Error>> */ => {
		return match(this.#is_valid_page(post_id, page_number),
			async (metadata) => {
				let markdown = (await fetch_text(`${this.#root}/${metadata.id}/${page_number}.md`)).unwrap();
				return new Ok(new Page(markdown));
			},
			async (err) => {
				return new Err(err);
			}
		);
	}

	get_next_page_number = (post_id /* string */, page_number /* number */) /* Result<Option<number>, Error> */ => {
		return match(this.#is_valid_page(post_id, page_number),
			(metadata) => {
				if (page_number !== metadata.page_count) {
					return new Ok(new Some(page_number + 1));
				} else {
					return new Ok(new None());
				}
			},
			(err) => {
				return new Err(err);
			}
		);
	}

	get_prev_page_number = (post_id /* string */, page_number /* number */) /* Result<Option<number>, Error> */ => {
		return match(this.#is_valid_page(post_id, page_number),
			(_metadata) => {
				if (page_number !== 1) {
					return new Ok(new Some(page_number - 1));
				} else {
					return new Ok(new None());
				}
			},
			(err) => {
				return new Err(err);
			}
		);
	}

	#is_valid_page = (post_id /* string */, page_number /* number */) /* Result<PostMetadata, Error> */ => {
		if (this.post_metadatas.hasOwnProperty(post_id)) {
			const metadata = this.post_metadatas[post_id];
			if (!isNaN(page_number)) {
				if (page_number <= metadata.page_count && page_number > 0) {
					return new Ok(metadata);
				} else {
					return new Err(new Error(`Post \`${metadata.id}\` does not have a page number \`${page_number}\``));
				}
			} else {
				return new Err(new Error(`Invalid page number\`${page_number}\``));
			}
		} else {
			return new Err(new Error(`Post \`${post_id}\` does not exit`));
		}
	}
}