//

//!

class TwoVariantEnum {
	is_first = () => {};
	is_second = () => {};
	unwrap_first = () => {};
	unwrap_second = () => {};
}

class Option extends TwoVariantEnum {
	// Some(some)
	// None

	is_some = () => {};
	is_none = () => {};
	unwrap = () => {};
}

export class Some extends Option {
	#some;

	constructor(some) {
		super();

		this.#some = some;
	}

	is_first = () => true;
	is_second = () => false;
	unwrap_first = () => { return this.#some; };
	unwrap_second = () => { return undefined; };

	is_some = this.is_first;
	is_none = this.is_second;
	unwrap = () => this.unwrap_first;
}

export class None extends Option {
	constructor() {
		super();
	}

	is_first = () => false;
	is_second = () => true;
	unwrap_first = () => { throw new Error(`called \`Option::unwrap()\` on a \`None\` value`) };
	unwrap_second = () => { return undefined; };

	is_some = this.is_first;
	is_none = this.is_second;
	unwrap = this.unwrap_first;
}

class Result extends TwoVariantEnum {
	// Ok(ok)
	// Err(err)

	is_ok = () => {};
	is_err = () => {};
	unwrap = () => {};
	unwrap_err = () => {};
}

export class Ok extends Result {
	#ok;

	constructor(ok) {
		super();

		this.#ok = ok;
	}

	is_first = () => true;
	is_second = () => false;
	unwrap_first = () => { return this.#ok; };
	unwrap_second = () => { throw new Error(`called \`Result::unwrap_err()\` on an \`Ok\` value: ${this.ok}`); };

	is_ok = this.is_first;
	is_err = this.is_second;
	unwrap = this.unwrap_first;
	unwrap_err = this.unwrap_second;
}

export class Err extends Result {
	#err;

	constructor(err) {
		super();

		this.#err = err;
	}

	is_first = () => false;
	is_second = () => true;
	unwrap_first = () => () => { throw new Error(`called \`Result::unwrap()\` on an \`Err\` value: ${this.err}`); };
	unwrap_second = () => this.err;

	is_ok = this.is_first;
	is_err = this.is_second;
	unwrap = this.unwrap_first;
	unwrap_err = this.unwrap_second;
}

export const match = (two_variant_enum, on_first, on_second) => {
	if (two_variant_enum.is_first()) {
		return on_first(two_variant_enum.unwrap_first());
	} else {
		return on_second(two_variant_enum.unwrap_second());
	}
}