//

//!

import { Some, None, Ok, Err, match } from "/static/script/rust.mjs";

import { Page, PostManager } from "./post.mjs";

import wasm_init from "/static/wasm/wasm.js";

const generate_title = async (page) => {
	let title_html = `<h1>${page.title}</h1>`
	let time_html = `<time datetime=${page.date}>${page.date}</time>`

	return title_html + time_html
}

const generate_table_of_contents = async (content) => {
	let headings = content.querySelectorAll("h2, h3, h4, h5, h6")
	let html = ""
	headings.forEach((heading) => {
		html += `<li><a href=#${heading.id}>${heading.innerHTML}</a></li>`
	})

	return `<ul>${html}</ul>`
}

const render_page = async (title, table_of_contents, content, page) => {
	// Title
	let title_html = await generate_title(page)
	title.innerHTML = title_html

	// Content
	content.innerHTML = page.html_content
	
	// Table of Contents
	let toc_html = await generate_table_of_contents(content)
	table_of_contents.innerHTML = `<h2>Table of Contents</h2>${toc_html}`
}

const main = async () => {
	let wasm = await wasm_init();
	wasm.root_post_main();

	let title = document.querySelector("#title");
	let table_of_contents = document.querySelector("#table_of_contents");
	let content = document.querySelector("#content");
	let next_button = document.querySelector("#next");
	let prev_button = document.querySelector("#prev");

	let post_manager = new PostManager("./_post/");
	await post_manager.fetch_list();

	let url = new URL(window.location.href);
	// If `post_id` parameter exists, render corresponding post.
	if (url.searchParams.get("post_id") !== null) {
		let post_id = url.searchParams.get("post_id");
		let page_number = parseInt(url.searchParams.get("page_number"));
		let page = await post_manager.get_page(post_id, page_number);
		await match(page,
			// If there is matching post with the given `post_id` and `page_number`, render it.
			async (ok) => {
				await render_page(title, table_of_contents, content, ok);
				let next = post_manager.get_next_page_number(post_id, page_number).unwrap();
				match(next,
					(some) => {
						next_button.addEventListener(`click`, () => {
							let url = new URL(window.location.href);
							url.searchParams.set(`page_number`, `${some}`);
							window.location.search = url.searchParams.toString();
						})
						next_button.hidden = false;
					},
					() => {
						next_button.hidden = true;
						next_button.addEventListener(`click`, () => {});
					}
				);
				let prev = post_manager.get_prev_page_number(post_id, page_number).unwrap();
				match(prev,
					(some) => {
						prev_button.addEventListener(`click`, () => {
							let url = new URL(window.location.href);
							url.searchParams.set(`page_number`, `${some}`);
							window.location.search = url.searchParams.toString();
						})
						prev_button.hidden = false;
					},
					() => {
						prev_button.hidden = true;
						prev_button.addEventListener(`click`, () => {});
					}
				);
			},
			// Else, render error message.
			async (err) => {
				let page = new Page(`# Unknown\n\nError: ${err.message}`);
				await render_page(title, table_of_contents, content, page);
			}
		);
	// Else, render list of posts.
	} else {
		let markdown = "# Post List\n\n";
		for (const [id, metadata] of Object.entries(post_manager.post_metadatas)) {
			markdown += `## ${metadata.name}\n\n[Link](?post_id=${id}&page_number=1)\n\n`;
		}
		let page = new Page(markdown);
		await render_page(title, table_of_contents, content, page);
	}
};

main();