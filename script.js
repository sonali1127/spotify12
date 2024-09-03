let currentSong = new Audio();
let currentIndex = -1;
let songs = [];
let songTitles = [];  

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbum() {
    let response = await fetch(`/songs/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(as);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="greenPlay">
                        <img src="images/greenPlay.svg" alt="play">
                    </div>
                    <div class="cardImage">
                        <img src="/songs/${folder}/cover.jpg" alt="cover">
                    </div>
                    <h4>${response.name}</h4>
                    <p>${response.description}</p>
                </div>
            `;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getSongs(`songs/${e.dataset.folder}`);
            playSong(songs[0], 0);  
        });
    });
}
async function displayAlbums() {
    let response = await fetch(`/music/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    let circleContainer = document.querySelector(".circleContainer");
    
    let array = Array.from(as);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/music/")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/music/${folder}/info.json`);
            let response = await a.json();
            circleContainer.innerHTML += `
                <div data-folder="${folder}" class="circle">
                    <div class="greenPlay">
                        <img src="images/greenPlay.svg" alt="play">
                    </div>
                    <div class="circleImage">
                    <img src="/music/${folder}/cover.jpg" alt="cover">
                    </div>
                    <h4>${response.name}</h4>
                    <p>${response.description}</p>
                </div>
            `;
        }
    }

    Array.from(document.getElementsByClassName("circle")).forEach(e => {
        e.addEventListener("click", async () => {
            songs = await getSongs(`music/${e.dataset.folder}`);
            playSong(songs[0], 0);  
        });
    });
}

async function getSongs(folder) {
    let response = await fetch(`/${folder}/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    let fetchedSongs = [];

    for (let element of as) {
        if (element.href.endsWith("mp3")) {
            fetchedSongs.push(`${folder}/${element.href.split(`/${folder}/`)[1]}`);
        }
    }

    let songList = document.querySelector(".songList ul");
    songList.innerHTML = "";

    songTitles = fetchedSongs.map(url => {
        if (url) {
            const fileName = decodeURIComponent(url.replace(/%20/g, ' '));
            return fileName.replace(/\(pagalworld\.com\.sb\)/gi, '')
            .replace(/128\s*Kbps/gi, '').replace(/_64/g," ")
            .replace(/\.\w+$/, '');
        }
        return "";
    });

    fetchedSongs.forEach((songURL, index) => {
        let [songTitle, movieName] = songTitles[index].split(" - ");
        let folderNames = songTitle.split('/').pop(); 
        console.log(folderNames)
        movieName = movieName || " ";
        songList.innerHTML +=
            `  <li class="flex align-item songLib">
                    <div class="invert">
                        <img src="images/music.svg" alt="music">
                    </div>
                    <div class="songInfo">
                        <p>${folderNames}</p>
                        <p>${movieName}</p>
                    </div>
                    <div class="invert playButton">
                        <img id="playing${index}" src="images/play.svg" alt="play">
                    </div>
                </li>`;
    });

    document.querySelectorAll(".songLib").forEach((button, index) => {
        button.addEventListener('click', () => {
            if (currentIndex === index) {
                togglePlayPause();
            } else {
                playSong(songs[index], index);
            }
        });
    });

    return fetchedSongs;
}

let togglePlayPause = () => {
    let playButton = document.getElementById('play');
    if (currentSong.paused) {
        playButton.src = "images/pause.svg";
        currentSong.play();
    } else {
        playButton.src = "images/play.svg";
        currentSong.pause();
    }
    updateSongListIcons();
};

let playSong = (songURL, index) => {
    console.log('Playing song:', songURL);  
    currentSong.src = songURL;
    currentSong.play();
    document.getElementById('play').src = "images/pause.svg";
    currentIndex = index;
    let [songTitle, movieName] = songTitles[index].split(" - ");
    let folderNames = songTitle.split('/').pop();     document.querySelector(".songNames").innerHTML = folderNames ;
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
    updatePrevNextState();
    updateSongListIcons();
};

function updatePrevNextState() {
    let prev = document.getElementById('prev');
    let next = document.getElementById('next');
    if (currentIndex === -1 || songs.length === 0) {
        prev.disabled = true;
        next.disabled = true;
        prev.classList.add('disabled');
        next.classList.add('disabled');
    } else {
        prev.disabled = false;
        next.disabled = false;
        prev.classList.remove('disabled');
        next.classList.remove('disabled');
    }
}

function updateSongListIcons() {
    let playButtons = document.querySelectorAll(".playButton img");
    playButtons.forEach((img, index) => {
        if (index === currentIndex && !currentSong.paused) {
            img.src = "images/pause.svg";
        } else {
            img.src = "images/play.svg";
        }
    });
}

async function main() {
    await displayAlbums();
    await displayAlbum()
    let playButton = document.getElementById('play');
    let prev = document.getElementById('prev');
    let next = document.getElementById('next');

    playButton.addEventListener("click", () => {
        if (currentIndex === -1 && songs.length > 0) {
            playSong(songs[0], 0);
        } else {
            togglePlayPause();
        }
    });

    prev.addEventListener("click", () => {
        currentSong.pause();
        if (currentIndex === -1) return;
        currentIndex = (currentIndex === 0) ? songs.length - 1 : currentIndex - 1;
        playSong(songs[currentIndex], currentIndex);
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        if (currentIndex === -1) return;
        currentIndex = (currentIndex >= songs.length - 1) ? 0 : currentIndex + 1;
        playSong(songs[currentIndex], currentIndex);
    });

    currentSong.addEventListener('timeupdate', () => {
        const currentTimeFormatted = secondsToMinutesSeconds(currentSong.currentTime);
        const durationFormatted = secondsToMinutesSeconds(currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${currentTimeFormatted} / ${durationFormatted}`;
        document.querySelector(".circleBar").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener('ended', () => {
        next.click();
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbarRect = e.target.getBoundingClientRect();
        const clickPosition = e.clientX - seekbarRect.left;
        const seekbarWidth = seekbarRect.width;

        const percent = (clickPosition / seekbarWidth) * 100;
        const newTime = (percent * currentSong.duration) / 100;

        if (!isNaN(newTime) && newTime >= 0 && newTime <= currentSong.duration) {
            currentSong.currentTime = newTime;
        }

        document.querySelector(".circleBar").style.left = percent + "%";
    });

    updatePrevNextState();
}

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-160%";
});

document.querySelector(".volume > input").addEventListener("input", (e) => {
    let sound = document.getElementById('sound');
    let vol = parseInt(e.target.value) / 100;
    currentSong.volume = vol;
    sound.src = vol === 0 ? "images/mute.svg" : "images/volume.svg";
});
document.querySelector(".volume > img").addEventListener("click",(e)=>{
    let sound=document.getElementById('sound');
    if(currentSong.volume>0){
        sound.src="images/mute.svg";
        currentSong.volume=0;
        document.querySelector(".volume").getElementsByTagName("input")[0].value=0;
    }
    else {
        sound.src="images/volume.svg";
        currentSong.volume=1;
        document.querySelector(".volume").getElementsByTagName("input")[0].value=30;
    }
})
document.addEventListener('DOMContentLoaded', () => {
    main();
});
