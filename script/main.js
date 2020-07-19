(function () {
    "use strict";

    let Timer = function (timeToWork = 0) {
        let self = this;

        self.secondsLeft = timeToWork;
        self.lineFillDegrees = 0;
        self.status = "stopped";

        self.__updateTime = function () {
            let timeLeftElem = document.querySelector(".process__time-left");
            let lineFillElem = document.querySelector(".process__filler");

            let minutes = Math.trunc(self.secondsLeft / 60);
            let seconds = Math.trunc(self.secondsLeft % 60);
            const MAX_STROKE_DASH_OFFSET = 113.09;

            if (seconds < 10) seconds = "0" + seconds;

            timeLeftElem.innerText = minutes + ":" + seconds;

            lineFillElem.setAttribute("stroke-dashoffset", self.lineFillDegrees * (MAX_STROKE_DASH_OFFSET / 360));
        }

        self.setTime = function (timeToWork) {
            self.secondsLeft = timeToWork;
            self.__updateTime();
        }

        self.__reset = function () {
            self.secondsLeft = 0;
            self.lineFillDegrees = 0;
        }

        self.start = function () {
            if (self.secondsLeft <= 0) return;

            document.querySelector(".process--start").setAttribute("hidden", "");
            document.querySelector(".process--pause").removeAttribute("hidden", "");

            let timeToWork = self.secondsLeft;

            self.timeRun = setInterval(function () {
                self.secondsLeft -= 0.01;
                self.lineFillDegrees += 360 / timeToWork * 0.01;

                if (self.lineFillDegrees >= 360) {
                    self.stop();
                    video.stop();
                }

                self.__updateTime();

            }, 10);

            self.status = "starts";
        }

        self.pause = function () {
            document.querySelector(".process--start").removeAttribute("hidden", "");
            document.querySelector(".process--pause").setAttribute("hidden", "");
            
            clearInterval(self.timeRun);

            self.status = "paused";
        }

        self.stop = function () {
            self.pause();
            self.__reset();
            self.secondsLeft = timeToWork;

            self.status = "stopped";
        }
    }

    let Video = function (mediaName, videoColor) {
        let self = this;

        self.color = videoColor;

        self.__render = function (mediaName) {
            let app = document.querySelector(".app");

            let videoTemplate = document.querySelector(".video-template")
                .cloneNode(true).content
                .querySelector(".video");
            let audioTemplate = document.querySelector(".audio-template")
                .cloneNode(true).content
                .querySelector(".audio");

            videoTemplate.src = "video/" + mediaName + ".mp4";
            audioTemplate.src = "audio/" + mediaName + ".mp3";

            app.prepend(videoTemplate);
            app.prepend(audioTemplate);

            return {
                video: videoTemplate,
                audio: audioTemplate,
            }
        }

        self.current = self.__render(mediaName);

        self.start = function () {
            if (timer.status === "stopped") return;

            document.querySelector(".process__total").dataset.color = self.color || "gray";

            self.current.video.play();
            self.current.audio.play();
        }

        self.pause = function () {
            self.current.video.pause();
            self.current.audio.pause();
        }

        self.change = function (mediaName, videoColor) {
            self.color = videoColor;

            self.current.video.src = "video/" + mediaName + ".mp4";
            self.current.audio.src = "audio/" + mediaName + ".mp3";
        }

        self.stop = function () {
            self.pause();
            
            self.current.video.currentTime, self.current.audio.currentTime = 0;
        }
    }


    let video = new Video("beach", "orange");

    let timer = new Timer(6);
    let startBtn = document.querySelector(".process__buttons");
    let timeSelectionElem = document.querySelector(".time-selection");
    let moodSelectionElem = document.querySelector(".mood-selection");

    startBtn.addEventListener("click", function () {
        switch (timer.status) {
            case "stopped":
                timer.start();
                video.start();
                break;
            case "starts":
                timer.pause();
                video.pause();
                break;
            case "paused":
                timer.start();
                video.start();
                break;
        }
    });

    timeSelectionElem.addEventListener("click", function (evt) {
        if (evt.target.tagName !== "BUTTON") return;

        timer.stop();
        timer.setTime(evt.target.value);

        video.stop();
    });

    moodSelectionElem.addEventListener("click", function (evt) {
        if (evt.target.tagName !== "BUTTON") return;

        video.change(evt.target.value, evt.target.dataset.color);

        if (timer.status === "starts") video.start();
    });
})();