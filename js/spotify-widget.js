const clientId = '056d2e3508944718af2541522201b066';
const redirectUri = 'https://bmaithya.vercel.app/callback.html';
let token = localStorage.getItem('spotify_access_token');
let tokenExpiry = localStorage.getItem('spotify_token_expiry');

if (token && tokenExpiry && Date.now() < tokenExpiry) {
    startWidget(token);
} else {
    document.getElementById('spotify-widget').addEventListener('click', loginToSpotify);

    window.addEventListener('message', (event) => {
        console.log('Received message:', event); // Debug
        if (event.origin !== window.location.origin) {
            console.log('Origin mismatch:', event.origin); // Debug
            return;
        }
        if (event.data.type === 'spotify-auth') {
            const params = new URLSearchParams(event.data.hash.substring(1));
            const accessToken = params.get('access_token');
            const expiresIn = params.get('expires_in') || 3600;
            if (accessToken) {
                localStorage.setItem('spotify_access_token', accessToken);
                localStorage.setItem('spotify_token_expiry', Date.now() + (expiresIn * 1000));
                startWidget(accessToken);
            } else {
                console.error('No access token received');
                showNotPlaying();
            }
        } else if (event.data.type === 'spotify-auth-error') {
            console.error('Spotify auth failed:', event.data.error); // Debug
            showNotPlaying();
        }
    });
}

function loginToSpotify() {
    const scope = 'user-read-currently-playing';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=token&show_dialog=true`;
    console.log('Auth URL:', authUrl); // Debug
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
        console.log('API Response:', response.status, response.statusText); // Debug
        if (response.status === 200) {
            const data = await response.json();
            console.log('API Data:', data); // Debug
            updateWidget(data);
        } else if (response.status === 204) {
            console.log('No active playback'); // Debug
            showNotPlaying();
        } else if (response.status === 401) {
            console.log('Unauthorized - invalid token'); // Debug
            localStorage.removeItem('spotify_access_token');
            localStorage.removeItem('spotify_token_expiry');
            loginToSpotify();
        } else {
            console.log('Other error:', response.status); // Debug
            showNotPlaying();
        }
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        showNotPlaying();
    }
}

function updateWidget(data) {
    console.log('Update Widget Data:', data); // Debug
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