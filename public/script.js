const fetchWithToken = (url, options) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to be logged in to perform this action');
        return;
    }
    options.headers = {
        ...options.headers,
        'Authorization': token
    };
    return fetch(url, options);
};

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Username: username, Password: password })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        document.getElementById('register-form').reset();
    });
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Username: username, Password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            alert('Login successful');
        } else {
            alert('Login failed');
        }
        document.getElementById('login-form').reset();
    });
});

document.getElementById('card-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const cardID = document.getElementById('card-id').value;
    const released = document.getElementById('released').value;
    const brand = document.getElementById('brand').value;
    const cardNumber = document.getElementById('card-number').value;
    const information = document.getElementById('information').value;
    const numbered = document.getElementById('numbered').value;
    const autoPatch = document.getElementById('auto-patch').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const collecting = document.getElementById('collecting').value;
    const got = document.getElementById('got').value;
    const frontPhoto = document.getElementById('front-photo').value;
    const backPhoto = document.getElementById('back-photo').value;

    const method = cardID ? 'PUT' : 'POST';
    const url = cardID ? `/cards/${cardID}` : '/cards';

    fetchWithToken(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Released: released,
            Brand: brand,
            Card_Number: cardNumber,
            Information: information,
            Numbered: numbered,
            AutoPatch: autoPatch,
            First_Name: firstName,
            Last_Name: lastName,
            Collecting: collecting,
            Got: got,
            Front_Photo: frontPhoto,
            Back_Photo: backPhoto
        })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        loadCards();
        document.getElementById('card-form').reset();
        document.getElementById('card-id').value = '';
    });
});


function loadCards() {
    fetch('/cards')
        .then(response => response.json())
        .then(cards => {
            const cardContainer = document.getElementById('card-container');
            cardContainer.innerHTML = '';
            cards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.innerHTML = `
                    <h3>${card.First_Name} ${card.Last_Name}</h3>
                    <p>Released: ${card.Released}</p>
                    <p>Brand: ${card.Brand}</p>
                    <p>Card Number: ${card.Card_Number}</p>
                    <p>Information: ${card.Information}</p>
                    <p>Numbered: ${card.Numbered}</p>
                    <p>AutoPatch: ${card.AutoPatch}</p>
                    <p>Collecting: ${card.Collecting}</p>
                    <p>Got: ${card.Got}</p>
                    <img src="${card.Front_Photo}" alt="Front Photo" style="width: 100px;">
                    <img src="${card.Back_Photo}" alt="Back Photo" style="width: 100px;">
                    <button onclick="editCard(${card.CardID})">Edit</button>
                    <button onclick="deleteCard(${card.CardID})">Delete</button>
                `;
                cardContainer.appendChild(cardElement);
            });
        });
}

function editCard(cardID) {
    fetch(`/cards/${cardID}`)
        .then(response => response.json())
        .then(card => {
            document.getElementById('card-id').value = cardID;
            document.getElementById('released').value = card.Released;
            document.getElementById('brand').value = card.Brand;
            document.getElementById('card-number').value = card.Card_Number;
            document.getElementById('information').value = card.Information;
            document.getElementById('numbered').value = card.Numbered;
            document.getElementById('auto-patch').value = card.AutoPatch;
            document.getElementById('first-name').value = card.First_Name;
            document.getElementById('last-name').value = card.Last_Name;
            document.getElementById('collecting').value = card.Collecting;
            document.getElementById('got').value = card.Got;
            document.getElementById('front-photo').value = card.Front_Photo;
            document.getElementById('back-photo').value = card.Back_Photo;
        });
}

function deleteCard(cardID) {
    fetchWithToken(`/cards/${cardID}`, { method: 'DELETE' })
        .then(response => response.text())
        .then(message => {
            alert(message);
            loadCards();
        });
}
