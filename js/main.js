'use strict';

var gTop5;
var gValue;
var gLastValue;
var KEY_SEARCH = 'SearchedVideos';
var storageValues = ['Superman','js','Looking Good'];
var youtubeApi = 'AIzaSyActt80vPu4ZZsNrMOoNRVRT5cx6WLvxJY';

function init() {
    var searchHistory = loadFromStorage(KEY_SEARCH);
    if (searchHistory[0]) storageValues = searchHistory;
    printHistorySearch();
    loadSearch();

}

function printHistorySearch() {
    console.log(storageValues)
    var elFooter = document.querySelector('.footer');
    var strHtmls = '';
    storageValues.forEach(function (value) {
        strHtmls += `
        <div class="history-value" onclick="searchHistoryValue(this)">
        ${value}
        </div>`;
    })
    elFooter.innerHTML = strHtmls;
}
function searchHistoryValue(clickedValue){
    var value=clickedValue.innerText;
    loadSearch(value)
}
function clearHistory() {
    storageValues = [];
    saveToStorage(KEY_SEARCH, storageValues);
    printHistorySearch();
    closeModal()
}

function openModal(){
    document.querySelector('.modal').classList.remove('hide')
    document.querySelector('body').classList.add('no-scroll')
}


function closeModal() {
    document.querySelector('.modal').classList.add('hide')
    document.querySelector('body').classList.remove('no-scroll')
}

function getSubmit() {
    var value = document.querySelector('.my-input').value;
    loadSearch(value);
}

function loadSearch(value) {
    if (!value) gValue = 'Html';
    else { 
        gValue = value;
        var notSearched=storageValues.filter(function(historyVal){
            return historyVal.toLowerCase() === value.toLowerCase();
        })
        if (!notSearched[0]) {   
            storageValues.push(value);
            saveToStorage(KEY_SEARCH, storageValues);
            printHistorySearch();
        }
    }
   
    loadTop5();
}


function loadTop5() {
    document.querySelector('h2 div').innerText = 'Loading';
    var prm = axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&key=${youtubeApi}&q=${gValue}`);
    prm.then(function (res) {
        getTop5(res.data);
        renderVideos();
    })
}

function getTop5(videosDetails) {
    videosDetails = videosDetails.items;
    var topVideos = videosDetails.map(function (videoDetails) {
        var video = {};
        video.title = videoDetails.snippet.title;
        video.url = 'https://www.youtube.com/embed/' + videoDetails.id.videoId;
        video.tumbnail = videoDetails.snippet.thumbnails.default.url;
        return video;
    })
    gTop5 = topVideos;
}

function renderVideos() {
    var strHtmls = gTop5.map(function (video, idx) {
        return `<div class="top5" onclick="renderPlayer(${idx})">
        <img src="${video.tumbnail}">
        <div class="top5-text">
        ${video.title}
        </div>
        </div>`;
    });
    document.querySelector('.videos-container').innerHTML = strHtmls.join('');
    if (!gTop5.length) document.querySelector('h2 div').innerText = 'We couldnt find any videos about your search.. \nplease try again!';
    else document.querySelector('h2 div').innerText = 'Videos had been successfully loaded';
    gLastValue = gValue;
}

function renderPlayer(videoNum) {

    if (window.innerWidth < 911) {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
    document.querySelector('.player-container').classList.remove('hide');
    var currVideo = gTop5[videoNum];
    var strHtml = `
    <div class="yt-player">
      <iframe width="420" height="345" src="${currVideo.url}"></iframe>
     </div>

     <div class="info">
     </div>`;
    document.querySelector('.player-container').innerHTML = strHtml;
    document.querySelector('h2 div').innerText = 'Please type to reload';
    getInfo();
}

function getInfo() {
    var prm = axios.get(`https://en.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=${gValue}&limit=5`);
    prm.then(function (res) {
        renderInfo(res.data);
    })
    renderInfo();
}

function renderInfo(data) {
    try {
        var strHtml = data[2][2] + data[2][3];
    }
    catch (error) {
        console.log('A problem has occurred:', error);
    }
    if (strHtml) document.querySelector('.info').innerHTML = strHtml;
    else document.querySelector('.info').innerHTML = 'Sorry we could not find information about your search value';
}
