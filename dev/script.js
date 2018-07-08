class core {
	constructor() {
	};


	type(text) {
		this._stack.push({value: text, func: '_type'});
		return this;
	};


	delete(count = 'all') {
		this._stack.push({value: count, func: '_delete'});
		return this;
	};


	pause(ms) {
		this._stack.push({value: ms, func: '_pause'});
		return this;
	};


	break() {
		this._stack.push({func: '_break'});
		return this;
	};


	options(options) {
		this._stack.push({value: options, func: '_options'});
		return this;
	};


	freeze() {
		this._stop = true;
	};


	unfreeze() {
		this._stop = false;
	};


	['_type'](text) {
		let that = this,
			index = 0;


		let timerId = setTimeout(function func() {

			if (!that._stop) {
				that._renderString += text[index];
				index++;
				that._render();



				if (index < text.length) {
					timerId = setTimeout(func, that._speed);
				} else {
					clearTimeout(timerId);
					++that._i;
					that._nextIteration(); 
				};
			} else {
				timerId = setTimeout(func, 30);
			} //если нажата пауза, пытаемся запустить каждые 30ms
		}, that._speed);
	}; //печатаем текст


	['_delete'](count, systemCall = false) {
		let that = this,
			index = 0,
			removalRate = that._removalRate;
		if (count == 'all') count = that._renderString.length;

		let timerId = setTimeout(function func() {
			if (!that._stop) {
				let indexBr = that._renderString.indexOf('<br>', that._renderString.length - 4);

				if (indexBr > 0) {
					that._renderString = that._renderString.slice(0, that._renderString.length - 4);
				} else {
					that._renderString = that._renderString.slice(0, that._renderString.length - 1);
				};

				index++
				that._render();

				if (index < count) {
					timerId = setTimeout(func, removalRate);
				} else {
					clearTimeout(timerId);
					if (!systemCall) ++that._i;
					that._nextIteration(); 
				};
			} else {
				timerId = setTimeout(func, 30);
			} //если нажата пауза, пытаемся запустить каждые 30ms
		}, removalRate);
	}; //удаление символов


	['_pause'](ms) {
		++this._i;
		setTimeout(() => { this._nextIteration() }, ms);
	}; //установка паузы


	['_break']() {
		this._renderString += '<br>';
		this._render();

		++this._i;
		this._nextIteration();
	}; //перенос строки


	['_options'](options) {
		({
			element: this._element = this._element,
			autoStart: this._autoStart = this._autoStart,
			speed: this._speed = this._speed,
			removalRate: this._removalRate = this._removalRate,
			loop: this._loop = this._loop
		} = options);

		++this._i;
		this._nextIteration();
	}; //установка новых настроек


	_reset() {
		this['_delete'](this._renderString.length, true);
		({
			element: this._element,
			autoStart: this._autoStart = false,
			speed: this._speed = 60,
			removalRate: this._removalRate = 30,
			afterStringPause: this.afterStringPause = 1000,
			loop: this._loop = false
		} = this._firstOptions);
	}; //установка дефолтных настроек


	_nextIteration() {
		if (this._i >= this._stack.length && !this._loop) {
			return;
		} else if (this._i >= this._stack.length && this._loop) {
			this._i = 0;
			this._reset();
		} else if (this._i < this._stack.length) {
			this[this._stack[this._i].func](this._stack[this._i].value);
		};
	}; //следующая итерация


	_render() {
		this._element.innerHTML = this._renderString;
	}; //рендер строки
};



class typing extends core {
	constructor(options) {
		super();

		if (options.cursor !== false) options.cursor = true;

		let wrapper = document.createElement('span');
		let message = document.createElement('span');
			message.style.color = 'inherit';

		options.element.appendChild(wrapper);
		wrapper.appendChild(message);

		if (options.cursor === true) {
			let cursor = document.createElement('span');
				cursor.style.color = 'inherit';
			cursor.innerHTML = options.cursorHTML || '|';

			if (options.blinkingCursor !== false && !document.getElementById('typing-style')) {
				let style = document.createElement('style');
				style.setAttribute('id', 'typing-style');
				style.innerHTML = "@keyframes blink { 50% { opacity: 0; } }";
				
				document.head.appendChild(style);
			};

			cursor.style.cssText = "\
				animation-name: blink;\
				animation-timing-function: ease-in-out;\
				animation-duration: 1s;\
				animation-iteration-count: infinite;\
				display: inline-block;"

			wrapper.appendChild(cursor);
		};

		options.element = message;

		this._firstOptions = options;
		({
			element: this._element,
			autoStart: this._autoStart = false,
			speed: this._speed = 60,
			removalRate: this._removalRate = 30,
			afterStringPause: this.afterStringPause = 1000,
			loop: this._loop = false,
		} = options);

		this._renderString = '';
		this._i = 0;
		this._stack = [],
		this._stop = false;

		if (options.strings !== undefined) {
			for (let i = 0; i < options.strings.length; i++) {
				this._stack.push({value: options.strings[i], func: '_type'});
				this._stack.push({value: this.afterStringPause, func: '_pause'});
				this._stack.push({value: options.strings[i].length, func: '_delete'});
			};
		};

		this.start = false;

		setTimeout(() => {
			if (!this._autoStart) {
				document.addEventListener('scroll', handler)
				handler();
			} else {
				this._nextIteration();
			};

		}, 0);

		let handler = () => {
			if (!this.start) {
				let windowPosition = {
					top: window.pageYOffset,
					right: window.pageXOffset + document.documentElement.clientWidth,
					bottom: window.pageYOffset + document.documentElement.clientHeight,
					left: window.pageXOffset
				}

				let coords = this._element.getBoundingClientRect();

				let targetPosition = {
					top: coords.top + window.pageYOffset,
					left: coords.left + window.pageXOffset,
					bottom: coords.bottom + window.pageYOffset,
					right: coords.right + window.pageXOffset
				}

				if (targetPosition.bottom > windowPosition.top && targetPosition.top < windowPosition.bottom && targetPosition.right > windowPosition.left && targetPosition.left < windowPosition.right) {
						console.log('go')
						this.start = true;
						this._nextIteration();
				}
			};
		};
	};
};

