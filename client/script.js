import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chat_container = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
	element.textContent = '';

	loadInterval = setInterval(() => {
		element.textContent += '.';

		if (element.textContent === '....') {
			element.textContent = '';
		}
	}, 300);
}

function typeText(element, text) {
	let index = 0;

	let textInterval = setInterval(() => {
		if (index < text.length) {
			element.innerHTML += text.charAt(index);
		} else {
			clearInterval(textInterval);
		}
	}, 20);
}

function generateUniqueId() {
	const timestamp = Date.now();
	const randomNumber = Math.random();
	const hexadecimalString = randomNumber.toString(16);

	return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
	return `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}" 
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}

const handleSubmit = async (event) => {
	event.preventDefault();

	const data = new FormData(form);

	// User's ChatStripe
	chat_container.innerHTML += chatStripe(false, data.get('prompt'));
	form.reset();

	// Bot's ChatStripe
	const uniqueId = generateUniqueId();
	chat_container.innerHTML += chatStripe(true, ' ', uniqueId);

	chat_container.scrollTop = chat_container.scrollHeight;

	const messageDiv = document.getElementById(uniqueId);
	loader(messageDiv);

	// Fetch data from server
	const response = await fetch('http://localhost:5001', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ prompt: data.get('prompt') }),
	});

	clearInterval(loadInterval);
	messageDiv.innerHTML = '';

	if (response.ok) {
		const data = await response.json();
		const parsedData = data.bot.trim();

		console.log(parsedData);
		typeText(messageDiv, parsedData);
	} else {
		const err = await response.text();

		messageDiv.innerHTML = 'Something went wrong ...';
		console.log(err);
		alert(err);
	}
};

// Form Event Listener on Submit - onClick & on Key Press
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (event) => {
	if (event.keyCode === 13) {
		handleSubmit(event);
	}
});
