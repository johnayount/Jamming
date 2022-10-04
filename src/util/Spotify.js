const clientId = '3f8581efcf054bc186cdc88d963edde3'
const redirectUri = 'http://localhost:3000/'



let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            console.log('already had the token: ' + accessToken)
            return accessToken;
        }
        // access token match check
        const accessTokenCheck = window.location.href.match(/access_token=([^&]*)/);
        const expiresInCheck = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenCheck && expiresInCheck) {
            accessToken = accessTokenCheck[1];
            const expiresIn = Number(expiresInCheck[1]);

        // This will allow new access token when previous one expires

            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('accessToken', null, '/');
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }
        
    },
    search (term){
        const accessToken = Spotify.getAccessToken();
        const headers = {
            Authorization: `Bearer ${accessToken}`
        }
        console.log(JSON.stringify(headers));

        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: headers
        }).then(response => {
            return response.json();
        }).then(jsonResponse=> {
            if(!jsonResponse.tracks)  {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album:track.album.name,
                uri:track.uri
            }));
        
        });

    },
    savePlaylist(name, trackUris) {
        if(!name || !trackUris){
            return;
        }
        const accessToken = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${accessToken}`};
        let userId;

        return fetch('https://api.spotify.com/v1/me',{headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId=jsonResponse.id;
            return fetch(`https://api.spotify.com/1/users/${userId}/playlists`,
            {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name })
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId= jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,{
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                }
                )
            })
        })
    }

    



}

export default Spotify;