var isPlaying = false;
var current = null;
var cards = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'];
var numberCards = 12;
var point = 0;
var normalTime = 75;
var hardTime = 62;
var maxTime = remainingTime = normalTime;
var running = null;

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
  }

  return array;
}

function playSound(type) {
    document.getElementById(type + '-sound').load();
    document.getElementById(type + '-sound').play();
}

function openModal(type) {
    $('.modal-backdrop').css('display', 'block');
    $('.modal').hide();
    //$('.modal.' + type).show('slow');
    $('.modal.' + type).fadeIn();
}

function closeModal() {
    $('.modal-backdrop').css('display', 'none');
    $('.modal').hide();
}

function flip(card) {
    // Check playing
    if (!isPlaying) return;

    // Disable click this card
    $(card).css('pointer-events', 'none');

    // Flip this card
    $(card).toggleClass('flipped');

    // Play flip sound
    playSound('flip');

    if (!current) {
        // Begin guess
        current = $(card);
    } else {
        // Disable click all cards
        $('.card').css('pointer-events', 'none');

        // Incorrect guess
        if (current.attr('data') != $(card).attr('data')) {
            // Flip down incorrect cards after 0.6s
            setTimeout(function(){
                current.toggleClass('flipped');
                $(card).toggleClass('flipped');
                current = null;

                // Play incorrect sound
                playSound('incorrect');

                // Enable click all cards
                if(isPlaying){
                    $('.card').css('pointer-events', 'auto');
                }
            }, 600);
        // Correct guess
        } else {   
            point++;

            // Highlight correct cards
            $(card).find('img').css({
                '-webkit-box-shadow': '0px 0px 15px 5px rgba(240,240,140,0.75)',
                '-moz-box-shadow': '0px 0px 15px 5px rgba(240,240,140,0.75)',
                'box-shadow': '0px 0px 15px 5px rgba(240,240,140,0.75)'
            });
            current.find('img').css({
                '-webkit-box-shadow': '0px 0px 15px 5px rgba(240,240,140,0.75)',
                '-moz-box-shadow': '0px 0px 15px 5px rgba(240,240,140,0.75)',
                'box-shadow': '0px 0px 15px 5px rgba(240,240,140,0.75)'
            });

            // Hide correct cards after 0.6s
            setTimeout(function(){
                $(card).css('opacity', '0').attr('onclick', '')
                .children().children('img').css('cursor', 'default');
                current.css('opacity', '0').attr('onclick', '')
                .children().children('img').css('cursor', 'default');
                current = null;

                // Play correct sound
                playSound('correct');

                // End game if enough point
                if (point == numberCards) {
                    // Stop background music
                    document.getElementById('bg-music').load();

                    // Play win sound
                    playSound('win');

                    // Stop game
                    stopGame();
                    openModal('win');
                } else {
                    // Enable click all cards
                    $('.card').css('pointer-events', 'auto');
                }
            }, 600);
        }
    }
}

function loadContent() {
    // Reset progressbar
    $('.progressbar').css('display', 'none');

    // Shuffle all cards
    cards = shuffle(cards);

    // Add cards to screen
    var html = '';
    for (var i=0; i<cards.length; i++) {
        html += '<div class="grid"><div class="card" data="' + cards[i] + '" onclick="flip(this)">' +
        '<div class="front"><img src="img/back.jpg"/></div>' +
        '<div class="back"><img src="img/' + cards[i] + '.jpg"/></div></div></div>';
    };
    $('.content').html(html);

    // Open begin modal
    openModal('begin');
}

function startGame(mode) {
    // Set game mode
    if (mode == 1) {
        // Normal
        maxTime = remainingTime = normalTime;
        $('#bg-music').children().first().attr('src', 'audio/normal.mp3');
        $('.modal.win img').first().attr('src', 'img/win1.png');
    } else {
        // Hard
        maxTime = remainingTime = hardTime;
        $('#bg-music').children().first().attr('src', 'audio/hard.mp3');
        $('.modal.win img').first().attr('src', 'img/win2.png');
    }

    // Close modal
    closeModal();
    $('.btn-reset').css('opacity', '0');

    // Start game
    isPlaying = true;
    point = 0;
    var current = null;
    $('.card').css('pointer-events', 'auto');

    // Play background music
    document.getElementById('bg-music').load();
    document.getElementById('bg-music').play();

    // Start progressbar
    remainingTime = maxTime;
    $('.progressbar').css('display', 'block');
    $('progress').val(100);
    running = setInterval(function(){ 
        remainingTime--;
        $('progress').val(remainingTime / maxTime * 100);

        // 10s remaining
        if (remainingTime == 10) {
            playSound('count10');
        }

        // 5s remaining
        if (remainingTime == 5) {
            playSound('count5');
        }

        // Timeout => game over
        if (remainingTime == 0) {
            // Stop background music
            document.getElementById('bg-music').load();

            // Play lose sound
            $('#sound').children().first().attr('src', 'audio/lose.mp3');
            playSound('lose');

            // Stop game
            stopGame();
            openModal('lose');
            $('.btn-reset').css('opacity', '1');
        }
    }, 1000);
}

function stopGame() {
    isPlaying = false;

    if (running != null) {
        clearInterval(running);
        running = null;
    }
    
    $('.card').css('pointer-events', 'none');
}

$(function(){
    // Decrease effect sound volume
    document.getElementById('flip-sound').volume = 0.4;
    document.getElementById('incorrect-sound').volume = 0.4;
    document.getElementById('correct-sound').volume = 0.4;

    // Double cards
    cards = cards.concat(cards);

    // Load random background
    var number = Math.floor((Math.random() * 3) + 1);
    $('body').css('background', 'url("img/bg' + number + '.jpg") center center no-repeat');

    // Load content
    loadContent();
});