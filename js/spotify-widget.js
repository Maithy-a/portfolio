
const clientId = '056d2e3508944718af2541522201b066';
const redirectUrl = 'https://bmaithya.vercel.app/callback.html';

let token = localStorage.getItem('spotify_access_token');
let tokenExpiry = localStorage.getItem('spotify_token_expiry');

if (token && tokenExpiry && Date.now() < tokenExpiry) {
    startWidget(token);
} else {
    document.getElementById('spotify-widget').addEventListener('click', loginToSpotify);

    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type === 'spotify-auth') {
            const params = new URLSearchParams(event.data.hash.substring(1));
            const accessToken = params.get('access_token');
            const expiresIn = params.get('expires_in') || 3600;

            localStorage.setItem('spotify_access_token', accessToken);
            localStorage.setItem('spotify_token_expiry', Date.now() + (expiresIn * 1000));

            startWidget(accessToken);
        }
    });
}

function loginToSpotify() {
    const scope = 'user-read-currently-playing';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${scope}&response_type=token&show_dialog=true`;

    window.open(authUrl, 'SpotifyLogin', 'width=500,height=600');
}

function startWidget(accessToken) {
    token = accessToken;
    document.getElementById('spotify-widget').style.cursor = 'default'; 

    fetchNowPlaying();
    setInterval(fetchNowPlaying, 10000); 
}

async function fetchNowPlaying() {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 200) {
            const data = await response.json();
            updateWidget(data);
        } else {
            showNotPlaying();
        }
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        showNotPlaying();
    }
}

function updateWidget(data) {
    if (!data || !data.item) {
        showNotPlaying();
        return;
    }

    const trackName = data.item.name;
    const artistName = data.item.artists.map(artist => artist.name).join(', ');

    document.getElementById('spotify-track').textContent = trackName;
    document.getElementById('spotify-artist').textContent = artistName;
}

function showNotPlaying() {
    document.getElementById('spotify-track').innerHTML = '<i>No track playing</i>';
    document.getElementById('spotify-artist').textContent = '';
}
